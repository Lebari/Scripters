#!/usr/bin/env python
"""
Test script for verifying auction expiration mechanism
Usage:
  python test_expiration.py create <slug> <duration_minutes>  # Create a test auction that expires after duration_minutes
  python test_expiration.py check <slug>                     # Check status of a specific auction
  python test_expiration.py list                             # List all active auctions
  python test_expiration.py test-notification                # Send a test notification through Redis
"""

import sys
import json
import logging
import redis
from datetime import datetime, timedelta
from app.models import Auction, Item, User, AuctionType
from database import init_db

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def create_test_auction(slug, duration_minutes):
    """Create a test auction that will expire after the specified duration"""
    init_db()
    
    # Check if auction with this slug already exists
    existing = Auction.objects(slug=slug).first()
    if existing:
        logging.info(f"An auction with slug {slug} already exists!")
        return
    
    # Get or create test user
    test_user = User.objects(username="test_user").first()
    if not test_user:
        test_user = User(
            fname="Test",
            lname="User",
            username="test_user",
            password="password",
            is_seller=True,
            streetno=123,
            street="Test Street",
            city="Test City",
            country="Test Country",
            postal="12345"
        )
        test_user.save()
        logging.info("Created test user")
    
    # Create test item
    test_item = Item(
        name=f"Test Item for {slug}",
        price=100,
        status=True,
        category="Test"
    )
    test_item.save()
    logging.info(f"Created test item for {slug}")
    
    # Create auction
    current_time = datetime.utcnow()
    duration = int(duration_minutes)
    expiration_time = current_time + timedelta(minutes=duration)
    
    test_auction = Auction(
        item=test_item,
        slug=slug,
        auction_type=AuctionType.FORWARD,
        duration=duration,
        seller=test_user,
        is_active=True,
        date_added=current_time,
        date_updated=current_time
    )
    test_auction.save()
    
    logging.info(f"Created test auction {slug} with duration {duration} minutes")
    logging.info(f"Current time: {current_time.isoformat()}")
    logging.info(f"Expiration time: {expiration_time.isoformat()}")
    logging.info(f"The auction should expire around that time")
    
    # Add auction to user's auctions list
    test_user.auctions.append(test_auction.id)
    test_user.save()
    
    return test_auction

def check_auction_status(slug):
    """Check the status of a specific auction"""
    init_db()
    
    auction = Auction.objects(slug=slug).first()
    if not auction:
        logging.info(f"No auction found with slug: {slug}")
        return
    
    current_time = datetime.utcnow()
    expiration_time = auction.date_added + timedelta(minutes=auction.duration)
    time_left = expiration_time - current_time
    
    logging.info(f"Auction: {auction.slug}")
    logging.info(f"Item: {auction.item.name}")
    logging.info(f"Active: {auction.is_active}")
    logging.info(f"Date added: {auction.date_added.isoformat()}")
    logging.info(f"Duration: {auction.duration} minutes")
    logging.info(f"Expected expiration: {expiration_time.isoformat()}")
    
    if auction.is_active:
        if current_time < expiration_time:
            logging.info(f"Status: Active, will expire in {time_left}")
        else:
            logging.info(f"Status: Should be expired! Current time {current_time.isoformat()} is past expiration time")
    else:
        logging.info(f"Status: Expired")
        if auction.date_updated:
            logging.info(f"Was marked expired at: {auction.date_updated.isoformat()}")

def list_active_auctions():
    """List all active auctions"""
    init_db()
    
    active_auctions = Auction.objects(is_active=True)
    count = len(active_auctions)
    
    logging.info(f"Found {count} active auctions:")
    
    for auction in active_auctions:
        current_time = datetime.utcnow()
        expiration_time = auction.date_added + timedelta(minutes=auction.duration)
        time_left = expiration_time - current_time
        
        logging.info(f"  - {auction.slug}: {auction.item.name}, expires in {time_left}")

def send_test_notification():
    """Send a test notification through Redis"""
    try:
        redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)
        
        # Test Redis connection first
        try:
            redis_client.ping()
            logging.info("✅ Redis connection successful")
        except redis.ConnectionError as e:
            logging.error(f"❌ Redis connection failed: {e}")
            logging.error("Please make sure Redis is running (redis-server)")
            return False
        
        # Get current timestamp for easier correlation in logs
        timestamp = datetime.utcnow().timestamp()
        
        # Test both types of notifications
        expired_data = {
            'test': True,
            'auction_id': 'test_id',
            'auction_slug': 'test_slug',
            'expired_at': timestamp,
            'winner': None,
            'message': 'This is a test notification from test_expiration.py'
        }
        
        won_data = {
            'test': True,
            'auction_id': 'test_id_2',
            'auction_slug': 'test_slug_2',
            'winner_id': 'test_winner',
            'final_price': 100,
            'expired_at': timestamp,
            'message': 'This is a test win notification from test_expiration.py'
        }
        
        # Send test messages
        expired_result = redis_client.publish('auction_expired', json.dumps(expired_data))
        logging.info(f"Published test auction_expired notification, received by {expired_result} subscribers")
        
        won_result = redis_client.publish('auction_won', json.dumps(won_data))
        logging.info(f"Published test auction_won notification, received by {won_result} subscribers")
        
        # Provide troubleshooting information
        if expired_result == 0 and won_result == 0:
            logging.warning("⚠️ No subscribers received the test notifications!")
            logging.warning("This could indicate that the Flask server is not running or Redis listener is not working.")
            logging.warning("Make sure your backend server is running with 'flask run' or 'python run.py'")
            return False
        else:
            logging.info("✅ Test notifications sent successfully")
            return True
            
    except Exception as e:
        logging.error(f"❌ Error sending test notification: {e}")
        return False

def test_socketio_connection():
    """Test if the SocketIO server is accepting connections"""
    try:
        import requests
        
        response = requests.get("http://localhost:5000/socket.io/?EIO=4&transport=polling")
        if response.status_code == 200:
            logging.info("✅ SocketIO server is accepting connections")
            return True
        else:
            logging.error(f"❌ SocketIO server returned status code {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        logging.error("❌ Could not connect to the SocketIO server - make sure Flask is running")
        return False
    except Exception as e:
        logging.error(f"❌ Error testing SocketIO connection: {e}")
        return False

def main():
    """Main function to parse command line arguments and call the appropriate function"""
    if len(sys.argv) < 2:
        print(__doc__)
        return
    
    command = sys.argv[1]
    
    if command == "create" and len(sys.argv) >= 4:
        slug = sys.argv[2]
        duration = sys.argv[3]
        create_test_auction(slug, duration)
    
    elif command == "check" and len(sys.argv) >= 3:
        slug = sys.argv[2]
        check_auction_status(slug)
    
    elif command == "list":
        list_active_auctions()
    
    elif command == "test-notification":
        # First test the SocketIO connection
        socketio_ok = test_socketio_connection()
        if not socketio_ok:
            logging.warning("⚠️ SocketIO server connection test failed. Notifications might not be delivered to frontend.")
        
        # Then send the test notifications
        send_test_notification()
        
        # Print instructions for frontend testing
        print("\n-------------------------------------------------------------------------")
        print("🔍 Check your browser console for socket events and notification handling.")
        print("   You should see messages with 🏁 or 🏆 emoji if SocketIO is working.")
        print("-------------------------------------------------------------------------\n")
    
    else:
        print(__doc__)

if __name__ == "__main__":
    main() 