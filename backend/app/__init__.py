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


def create_app():
    # Configure Flask
    print("creating flask app")
    app = Flask(__name__)

    app.secret_key = SECRET_KEY

    app.config["CORS_HEADERS"] = "Content-Type"
    CORS(app)

    # Configure logging
    logging.basicConfig(level=logging.INFO)

    socketio = SocketIO(app)

    # Setup Redis client (ensure Redis is running on localhost:6379)
    try:
        redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)
        redis_client.ping()
    except redis.RedisError as e:
        logging.error(f"Redis connection error: {e}")
        raise

    
    def check_expired_auctions():
        """
        Query active auctions with type 'forward' and check if their expiration time has passed.
        For each expired auction, mark it as inactive and publish an event.
        """
        now = datetime.utcnow()
        # Query auctions where is_active is True and auction_type is 'forward'
        active_auctions = Auction.objects(is_active=True, auction_type=AuctionType.FORWARD)
        print(active_auctions)
        for auction in active_auctions:
            # Calculate the expiration time based on the auction's date_added and duration (in minutes)
            expiration_time = auction.date_added + timedelta(minutes=auction.duration)
            if now >= expiration_time:
                # Mark auction as expired
                auction.is_active = False
                auction.save()
                # Create event data
                event_data = {
                    'auction_id': auction.get_id(),
                    'expired_at': expiration_time.timestamp()
                }
                try:
                    redis_client.publish('auction_expired', json.dumps(event_data))
                    logging.info(f"Published expired auction event: {event_data}")
                except Exception as e:
                    logging.error(f"Error publishing auction {auction.get_id()}: {e}")

    # Set up APScheduler to run the auction expiration check every 10 seconds (adjust as needed)
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=check_expired_auctions, trigger="interval", seconds=10, id="auction_job")
    scheduler.start()

    def redis_listener():
        pubsub = redis_client.pubsub()
        try:
            pubsub.subscribe('auction_expired')
            for message in pubsub.listen():
                if message['type'] == 'message':
                    try:
                        data = json.loads(message['data'])
                        socketio.emit('auction_expired', data, broadcast=True)
                        logging.info(f"Forwarded auction expired event: {data}")
                    except json.JSONDecodeError as je:
                        logging.error(f"JSON decode error: {je}")
                    except Exception as inner_e:
                        logging.error(f"Error processing message: {inner_e}")
        except Exception as e:
            logging.error(f"Error in Redis listener: {e}")

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
    return app
