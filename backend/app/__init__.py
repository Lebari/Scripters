import logging
import json
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

# Check if in Docker environment (PYTHONPATH=/app) or local environment
if os.environ.get('PYTHONPATH') == '/app':
    # In Docker, imports are relative to /app
    from backend.database import *
    from backend.app.models import *
else:
    # In local environment with backend prefix
    from backend.database import *
    from backend.app.models import *

from flask_jwt_extended import JWTManager

from flask_socketio import SocketIO
from apscheduler.schedulers.background import BackgroundScheduler
import redis
import time

# Get Redis connection details from environment or use defaults
redis_host = os.environ.get('REDIS_HOST', 'localhost')
redis_port = int(os.environ.get('REDIS_PORT', 6379))

try:
    redis_client = redis.StrictRedis(host=redis_host, port=redis_port, db=0, decode_responses=True)
    redis_client.ping()
    logging.info(f"Successfully connected to Redis at {redis_host}:{redis_port}")
except redis.RedisError as e:
    logging.error(f"Redis connection error: {e}")
    raise

def create_app():
    # Configure Flask
    print("creating flask app")
    app = Flask(__name__)
    app.secret_key = SECRET_KEY

    # Configure CORS
    app.config["CORS_HEADERS"] = "Content-Type"
    CORS(app)

    # Configure logging
    logging.basicConfig(level=logging.INFO)

    # Set up SocketIO with CORS and event handling
    socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)

    # Attach the socketio instance to the app for external access
    app.socketio = socketio

    # Set up SocketIO event handlers for debugging
    @socketio.on('connect')
    def handle_connect():
        logging.info(f"[SOCKETIO] Client connected: {request.sid}")

    @socketio.on('disconnect')
    def handle_disconnect():
        logging.info(f"[SOCKETIO] Client disconnected: {request.sid}")

    @socketio.on('error')
    def handle_error(error):
        logging.error(f"[SOCKETIO] Error: {error}")

    @socketio.on('test_connection')
    def handle_test_connection(data):
        logging.info(f"[SOCKETIO] Received test connection: {data}")
        # Echo back the data to confirm receipt
        return {'status': 'connected', 'received_data': data}

    # Add a route to manually test the notification system
    @app.route('/test/notification/<notification_type>')
    def test_notification(notification_type):
        """Test endpoint to manually trigger a notification"""
        try:
            test_data = {
                'test': True,
                'timestamp': datetime.utcnow().timestamp(),
                'message': f"Test {notification_type} notification"
            }

            if notification_type == 'auction_expired':
                test_data['auction_id'] = 'test_id'
                test_data['auction_slug'] = 'test_slug'
                test_data['expired_at'] = datetime.utcnow().timestamp()
                redis_client.publish('auction_expired', json.dumps(test_data))
            elif notification_type == 'auction_won':
                test_data['auction_id'] = 'test_id'
                test_data['auction_slug'] = 'test_slug'
                test_data['winner_id'] = 'test_winner'
                test_data['final_price'] = 100
                redis_client.publish('auction_won', json.dumps(test_data))
            elif notification_type == 'auction_price_changed':
                test_data['auction_id'] = 'test_id'
                test_data['new_price'] = 100
                redis_client.publish('auction_price_changed', json.dumps(test_data))
            else:
                return jsonify({'error': 'Invalid notification type'}), 400

            logging.info(f"[TEST] Published test {notification_type} notification")
            return jsonify({'status': 'success', 'message': f'Test {notification_type} notification sent'}), 200
        except Exception as e:
            logging.error(f"[TEST] Error sending test notification: {e}")
            return jsonify({'error': str(e)}), 500

    # Setup Redis client (ensure Redis is running on localhost:6379)

    def check_expired_auctions():
        """
        Query active auctions with type 'forward' and check if their expiration time has passed.
        For each expired auction, mark it as inactive, determine the winner (auction.event.user),
        and publish an event with the auction ID, expiration timestamp, and winner information.
        """
        now = datetime.utcnow()
        logging.info(f"Running auction expiration check at UTC: {now.isoformat()}")

        # Query auctions where is_active is True and auction_type is 'forward'
        active_auctions = Auction.objects(is_active=True, auction_type=AuctionType.FORWARD)
        logging.info(f"Found {len(active_auctions)} active forward auctions")

        for auction in active_auctions:
            # Check if date_added is None and log an error
            if not auction.date_added:
                logging.error(f"Auction {auction.get_id()} ({auction.slug}) has no date_added field! Setting it now.")
                auction.date_added = now
                auction.save()
                continue

            # Calculate the expiration time based on the auction's date_added and duration (in minutes)
            expiration_time = auction.date_added + timedelta(minutes=auction.duration)

            # Add timezone debug information
            logging.info(f"Auction {auction.slug}: Added UTC: {auction.date_added.isoformat()}, Duration: {auction.duration}min, Expires UTC: {expiration_time.isoformat()}")
            logging.info(f"Current time UTC: {now.isoformat()}, Time diff from expiration: {now - expiration_time}")

            if now >= expiration_time:
                mark_auction_as_expired(auction)
            else:
                time_left = expiration_time - now
                logging.info(f"Auction {auction.slug} has {time_left} time remaining")

    def mark_auction_as_expired(auction):
        """
        Mark an auction as expired, determine the winner, and publish appropriate events.
        This is called either by the check_expired_auctions function or by individual auction timers.
        """
        now = datetime.utcnow()
        logging.info(f"[EXPIRATION] Timer fired for auction {auction.slug} at {now.isoformat()}")

        # Mark auction as expired if it's still active
        if auction.is_active:
            logging.info(f"[EXPIRATION] Auction {auction.slug} is active, marking as inactive")
            auction.is_active = False
            auction.date_updated = now
            auction.save()
            logging.info(f"[EXPIRATION] Successfully marked auction {auction.slug} as inactive")
        else:
            # Auction is already marked as inactive, no need to proceed
            logging.info(f"[EXPIRATION] Auction {auction.slug} is already marked as inactive, stopping expiration process")
            return

        # Determine the winner: assuming auction.event exists and has a 'user' field
        winner_id = None
        final_price = 0
        if auction.event and hasattr(auction.event, 'user') and auction.event.user:
            # You may also include additional winner details if needed
            winner_id = auction.event.user.get_id()
            final_price = auction.event.price
            logging.info(f"[EXPIRATION] Auction winner is user ID: {winner_id} with final price {final_price}")
        else:
            logging.info(f"[EXPIRATION] No winner for auction {auction.slug}")

        try:
            # Get auction details for the notification
            auction_data = auction.to_json()
            logging.info(f"[EXPIRATION] Prepared auction data for notification: {auction.slug}")

            # If there's a winner, publish direct auction_won event only
            # Otherwise publish general auction_expired event
            if winner_id:
                # Create a more detailed event specifically for the winner
                won_event_data = {
                    'auction_id': auction.get_id(),
                    'auction_slug': auction.slug,  # Add slug for easier lookup
                    'winner_id': winner_id,
                    'final_price': final_price,
                    'expired_at': (auction.date_added + timedelta(minutes=auction.duration)).timestamp(),
                    'auction': auction_data
                }

                # Publish the auction_won event
                logging.info(f"[EXPIRATION] Publishing auction_won event for auction {auction.slug} to Redis")
                redis_client.publish('auction_won', json.dumps(won_event_data))
                logging.info(f"[EXPIRATION] Successfully published auction_won event to Redis: {auction.slug}")
            else:
                # Only publish the expired event if there's no winner
                expired_event_data = {
                    'auction_id': auction.get_id(),
                    'auction_slug': auction.slug,  # Add slug for easier lookup
                    'expired_at': (auction.date_added + timedelta(minutes=auction.duration)).timestamp(),
                    'winner': winner_id
                }

                # Publish the expired auction event
                logging.info(f"[EXPIRATION] Publishing auction_expired event for auction {auction.slug} to Redis")
                redis_client.publish('auction_expired', json.dumps(expired_event_data))
                logging.info(f"[EXPIRATION] Successfully published auction_expired event to Redis: {auction.slug}")
        except Exception as e:
            logging.error(f"[EXPIRATION] Error publishing auction events for {auction.get_id()}: {e}")

    def schedule_auction_expiration(auction):
        """
        Set a timer for an auction to expire based on its duration.
        This is called when a new auction is created.
        """
        if not auction.date_added:
            logging.warning(f"[SCHEDULING] Auction {auction.slug} has no date_added, setting it now")
            auction.date_added = datetime.utcnow()
            auction.save()

        # Calculate the expiration time
        expiration_time = auction.date_added + timedelta(minutes=auction.duration)

        # Calculate seconds until expiration
        now = datetime.utcnow()
        seconds_until_expiration = max(0, (expiration_time - now).total_seconds())

        logging.info(f"[SCHEDULING] Auction {auction.slug} to expire in {seconds_until_expiration} seconds (at {expiration_time.isoformat()})")

        # Schedule the expiration
        if seconds_until_expiration > 0:
            # Use APScheduler to schedule a one-time job for this specific auction
            try:
                job_id = f"auction_expiry_{auction.get_id()}"
                logging.info(f"[SCHEDULING] Adding job {job_id} for auction {auction.slug}")

                # Use the auction id as a reference to fetch a fresh instance when the job runs
                auction_id = auction.get_id()

                # Define a wrapper function that fetches the auction afresh when executed
                def expire_auction_by_id():
                    try:
                        # Get a fresh copy of the auction from the database
                        current_auction = Auction.objects(id=auction_id).first()
                        if current_auction:
                            mark_auction_as_expired(current_auction)
                        else:
                            logging.error(f"[SCHEDULING] Auction with ID {auction_id} no longer exists")
                    except Exception as e:
                        logging.error(f"[SCHEDULING] Error in expire_auction_by_id: {e}")

                # Schedule the job with the wrapper function
                scheduler.add_job(
                    func=expire_auction_by_id,
                    trigger="date",
                    run_date=expiration_time,
                    id=job_id,
                    replace_existing=True
                )
                logging.info(f"[SCHEDULING] Successfully scheduled expiration timer for auction {auction.slug}")

                # Log all currently scheduled jobs
                jobs = scheduler.get_jobs()
                logging.info(f"[SCHEDULING] Current scheduled jobs: {[job.id for job in jobs]}")
            except Exception as e:
                logging.error(f"[SCHEDULING] Error scheduling timer for auction {auction.slug}: {e}")
        else:
            # If the auction should already be expired, mark it as expired immediately
            logging.warning(f"[SCHEDULING] Auction {auction.slug} should already be expired. Marking as expired immediately.")
            mark_auction_as_expired(auction)

    def redis_listener():
        pubsub = redis_client.pubsub()
        # Track processed events to prevent duplicates
        processed_events = set()

        try:
            # Subscribe to multiple channels
            logging.info("[REDIS] Subscribing to Redis channels: auction_expired, auction_price_changed, auction_won")
            pubsub.subscribe('auction_expired', 'auction_price_changed', 'auction_won')
            logging.info("[REDIS] Successfully subscribed to Redis channels")

            for message in pubsub.listen():
                if message['type'] == 'message':
                    try:
                        logging.info(f"[REDIS] Received message on channel {message['channel']}")
                        data = json.loads(message['data'])

                        # Create a unique event identifier using auction_id/slug and event type
                        event_id = None
                        if 'auction_id' in data:
                            event_id = f"{data['auction_id']}_{message['channel']}"
                        elif 'auction_slug' in data:
                            event_id = f"{data['auction_slug']}_{message['channel']}"

                        # Skip if we've already processed this event
                        if event_id and event_id in processed_events:
                            logging.info(f"[REDIS] Skipping duplicate event: {event_id}")
                            continue

                        # Add to processed events if we have an identifier
                        if event_id:
                            processed_events.add(event_id)
                            # Limit set size to prevent memory issues
                            if len(processed_events) > 1000:
                                processed_events.clear()

                        # Check which channel the message came from and emit accordingly
                        if message['channel'] == 'auction_expired':
                            logging.info(f"[REDIS] Emitting auction_expired event via SocketIO: {data}")
                            socketio.emit('auction_expired', data)
                            logging.info(f"[REDIS] Successfully emitted auction_expired event")
                        elif message['channel'] == 'auction_price_changed':
                            logging.info(f"[REDIS] Emitting auction_price_changed event via SocketIO: {data}")
                            socketio.emit('auction_price_changed', data)
                            logging.info(f"[REDIS] Successfully emitted auction_price_changed event")
                        elif message['channel'] == 'auction_won':
                            logging.info(f"[REDIS] Emitting auction_won event via SocketIO: {data}")
                            socketio.emit('auction_won', data)
                            logging.info(f"[REDIS] Successfully emitted auction_won event to winner")
                    except json.JSONDecodeError as je:
                        logging.error(f"[REDIS] JSON decode error: {je}")
                    except Exception as inner_e:
                        logging.error(f"[REDIS] Error processing message: {inner_e}")
        except Exception as e:
            logging.error(f"[REDIS] Error in Redis listener: {e}")
            # Try to reconnect if the connection is lost
            logging.info("[REDIS] Attempting to reconnect to Redis...")
            time.sleep(5)  # Wait a bit before reconnecting
            socketio.start_background_task(redis_listener)




    # Configure JWT Manager for session mgt.
    app.config["JWT_SECRET_KEY"] = SECRET_KEY
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=2)
    jwt = JWTManager(app)

    @jwt.user_lookup_loader
    def user_lookup_loader(_jwt_header, jwt_data):
        # defines how current_user is determined
        username = jwt_data["sub"]
        return User.objects(username=username).first() or None

    from .src import src as main_blueprint
    from .tests import tests as tests_blueprint

    # register blueprints
    app.register_blueprint(main_blueprint)
    app.register_blueprint(tests_blueprint)

    init_db()

    # Set up APScheduler for individual auction timers instead of periodic check
    scheduler = BackgroundScheduler()

    # Function to verify that scheduled jobs are working correctly
    def verify_auction_expiration_jobs():
        """Verify that all active auctions have correctly scheduled expiration jobs"""
        logging.info("[VERIFICATION] Running expiration jobs verification check")

        # Get all active auctions
        active_auctions = Auction.objects(is_active=True)
        auction_count = len(active_auctions)
        logging.info(f"[VERIFICATION] Found {auction_count} active auctions")

        # Get all scheduled jobs
        jobs = scheduler.get_jobs()
        job_count = len(jobs)
        job_ids = [job.id for job in jobs]
        logging.info(f"[VERIFICATION] Found {job_count} scheduled jobs: {job_ids}")

        # Check if every active auction has a corresponding job
        for auction in active_auctions:
            job_id = f"auction_expiry_{auction.get_id()}"

            # Check if the job exists
            job = scheduler.get_job(job_id)
            if not job:
                logging.warning(f"[VERIFICATION] Missing job for active auction {auction.slug} (id: {auction.get_id()})")

                # Re-schedule the job
                logging.info(f"[VERIFICATION] Re-scheduling missing job for auction {auction.slug}")
                schedule_auction_expiration(auction)
            else:
                # Calculate when the job will run
                now = datetime.utcnow()
                run_time = job.next_run_time

                # Handle timezone awareness - convert run_time to naive datetime for comparison
                if hasattr(run_time, 'tzinfo') and run_time.tzinfo is not None:
                    # Convert to a naive datetime for comparison with utcnow
                    run_time_naive = run_time.replace(tzinfo=None)
                    time_until_job = run_time_naive - now
                else:
                    time_until_job = run_time - now

                # Log the scheduled run time
                logging.info(f"[VERIFICATION] Job for auction {auction.slug} will run at {run_time.isoformat()} (in {time_until_job})")

                # Check if the job should have run already but didn't
                expiration_time = auction.date_added + timedelta(minutes=auction.duration)
                if now > expiration_time:
                    logging.warning(f"[VERIFICATION] Auction {auction.slug} should have expired already but is still active")
                    logging.info(f"[VERIFICATION] Manually triggering expiration for auction {auction.slug}")
                    mark_auction_as_expired(auction)

    # Schedule expiration for all existing active auctions on startup
    active_auctions = Auction.objects(is_active=True)
    for auction in active_auctions:
        schedule_auction_expiration(auction)

    # Add a verification job that runs every minute
    scheduler.add_job(func=verify_auction_expiration_jobs, trigger="interval", minutes=1, id="expiration_verification_job")

    # Start the scheduler
    scheduler.start()
    logging.info("[STARTUP] Scheduler started successfully")

    socketio.start_background_task(redis_listener)

    # Make these functions available to be imported by other modules
    app.mark_auction_as_expired = mark_auction_as_expired
    app.schedule_auction_expiration = schedule_auction_expiration
    app.check_expired_auctions = check_expired_auctions

    return app