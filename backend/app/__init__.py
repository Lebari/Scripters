import logging
import json
from datetime import datetime, timedelta
from flask import Flask
from flask_cors import CORS
from backend.database import *
from backend.app.models import *
from flask_jwt_extended import JWTManager

from flask_socketio import SocketIO
from apscheduler.schedulers.background import BackgroundScheduler
import redis

try:
    redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)
    redis_client.ping()
except redis.RedisError as e:
    logging.error(f"Redis connection error: {e}")
    raise

def create_app():
    # Configure Flask
    print("creating flask app")
    app = Flask(__name__)

    app.secret_key = SECRET_KEY

    app.config["CORS_HEADERS"] = "Content-Type"
    CORS(app)

    # Configure logging
    logging.basicConfig(level=logging.INFO)


    socketio = SocketIO(app, cors_allowed_origins="*")

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
                logging.info(f"Auction {auction.slug} has expired! Marking as inactive.")
                # Mark auction as expired
                auction.is_active = False
                auction.date_updated = now
                auction.save()
                
                # Determine the winner: assuming auction.event exists and has a 'user' field
                winner_id = None
                final_price = 0
                if auction.event and hasattr(auction.event, 'user') and auction.event.user:
                    # You may also include additional winner details if needed
                    winner_id = auction.event.user.get_id()
                    final_price = auction.event.price
                    logging.info(f"Auction winner is user ID: {winner_id}")
                else:
                    logging.info(f"No winner for auction {auction.slug}")
                
                try:
                    # Create expired auction event data
                    expired_event_data = {
                        'auction_id': auction.get_id(),
                        'auction_slug': auction.slug,  # Add slug for easier lookup
                        'expired_at': expiration_time.timestamp(),
                        'winner': winner_id
                    }
                    
                    # Publish the expired auction event
                    redis_client.publish('auction_expired', json.dumps(expired_event_data))
                    logging.info(f"Published expired auction event: {expired_event_data}")
                    
                    # If there's a winner, also publish a direct auction_won event
                    if winner_id:
                        # Get auction details for the notification
                        auction_data = auction.to_json()
                        
                        # Create a more detailed event specifically for the winner
                        won_event_data = {
                            'auction_id': auction.get_id(),
                            'auction_slug': auction.slug,  # Add slug for easier lookup
                            'winner_id': winner_id,
                            'final_price': final_price,
                            'auction': auction_data
                        }
                        
                        # Publish the auction_won event
                        redis_client.publish('auction_won', json.dumps(won_event_data))
                        logging.info(f"Published direct auction_won event for winner {winner_id}: {won_event_data}")
                    
                except Exception as e:
                    logging.error(f"Error publishing auction events for {auction.get_id()}: {e}")
            else:
                time_left = expiration_time - now
                logging.info(f"Auction {auction.slug} has {time_left} time remaining")


    def redis_listener():
        pubsub = redis_client.pubsub()
        try:
            # Subscribe to multiple channels
            pubsub.subscribe('auction_expired', 'auction_price_changed', 'auction_won')
            for message in pubsub.listen():
                if message['type'] == 'message':
                    try:
                        data = json.loads(message['data'])
                        # Check which channel the message came from and emit accordingly
                        if message['channel'] == 'auction_expired':
                            socketio.emit('auction_expired', data)
                            logging.info(f"Forwarded auction expired event: {data}")
                        elif message['channel'] == 'auction_price_changed':
                            socketio.emit('auction_price_changed', data)
                            logging.info(f"Forwarded auction price changed event: {data}")
                        elif message['channel'] == 'auction_won':
                            socketio.emit('auction_won', data)
                            logging.info(f"Forwarded auction won event to winner: {data}")
                    except json.JSONDecodeError as je:
                        logging.error(f"JSON decode error: {je}")
                    except Exception as inner_e:
                        logging.error(f"Error processing message: {inner_e}")
        except Exception as e:
            logging.error(f"Error in Redis listener: {e}")


    

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


    # Set up APScheduler to run the auction expiration check every 10 seconds (adjust as needed)
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=check_expired_auctions, trigger="interval", seconds=10, id="auction_job")
    scheduler.start()

    socketio.start_background_task(redis_listener)

    return app
