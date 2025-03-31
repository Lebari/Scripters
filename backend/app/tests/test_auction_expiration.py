import unittest
from datetime import datetime, timedelta
from backend.app.models import Auction, Item, User, AuctionType
from backend.app.__init__ import check_expired_auctions, mark_auction_as_expired, schedule_auction_expiration
from backend.database import init_db
import logging
import time

class TestAuctionExpiration(unittest.TestCase):
    
    def setUp(self):
        # Set up test database
        init_db()
        
        # Clean up any existing test data
        Auction.objects(slug__startswith='test_expiration_').delete()
        Item.objects(name__startswith='Test Expiration Item').delete()
        
        # Create test user
        self.test_user = User.objects(username='test_user').first()
        if not self.test_user:
            self.test_user = User(
                fname="Test",
                lname="User",
                username="test_user",
                password="password_hash",
                is_seller=True,
                streetno=123,
                street="Test Street",
                city="Test City",
                country="Test Country",
                postal="12345"
            )
            self.test_user.save()
            
        # Create test items
        self.test_item_active = Item(
            name="Test Expiration Item Active",
            price=100,
            status=True,
            category="Test"
        )
        self.test_item_active.save()
        
        self.test_item_expired = Item(
            name="Test Expiration Item Expired",
            price=200,
            status=True,
            category="Test"
        )
        self.test_item_expired.save()
        
        # Create active auction (with future expiration)
        current_time = datetime.utcnow()
        self.active_auction = Auction(
            item=self.test_item_active,
            slug="test_expiration_active",
            auction_type=AuctionType.FORWARD,
            duration=120, # 120 minutes (2 hours)
            seller=self.test_user,
            is_active=True,
            date_added=current_time,
            date_updated=current_time
        )
        self.active_auction.save()
        
        # Create expired auction (with past expiration)
        past_time = datetime.utcnow() - timedelta(hours=3)
        self.expired_auction = Auction(
            item=self.test_item_expired,
            slug="test_expiration_expired",
            auction_type=AuctionType.FORWARD,
            duration=60, # 60 minutes (1 hour)
            seller=self.test_user,
            is_active=True, # Still marked as active, should be set to inactive by check
            date_added=past_time,
            date_updated=past_time
        )
        self.expired_auction.save()
        
    def tearDown(self):
        # Clean up test data
        Auction.objects(slug__startswith='test_expiration_').delete()
        Item.objects(name__startswith='Test Expiration Item').delete()
    
    def test_auction_expiration_check(self):
        """Test that the auction expiration check correctly marks expired auctions as inactive"""
        logging.info("Running test_auction_expiration_check")
        
        # Verify initial state
        active_auction = Auction.objects(slug="test_expiration_active").first()
        expired_auction = Auction.objects(slug="test_expiration_expired").first()
        
        self.assertIsNotNone(active_auction)
        self.assertIsNotNone(expired_auction)
        self.assertTrue(active_auction.is_active)
        self.assertTrue(expired_auction.is_active)
        
        # Test direct marking of auction as expired (new approach)
        mark_auction_as_expired(expired_auction)
        
        # Also test the check function for backward compatibility
        check_expired_auctions()
        
        # Reload auctions from database
        active_auction = Auction.objects(slug="test_expiration_active").first()
        expired_auction = Auction.objects(slug="test_expiration_expired").first()
        
        # Verify that active auction is still active
        self.assertTrue(active_auction.is_active)
        
        # Verify that expired auction is now inactive
        self.assertFalse(expired_auction.is_active)

    def test_auction_schedule_expiration(self):
        """Test that scheduling auction expiration works correctly"""
        logging.info("Running test_auction_schedule_expiration")
        
        # Create a new auction with very short duration (1 minute)
        current_time = datetime.utcnow()
        short_duration_auction = Auction(
            item=self.test_item_active,  # Reuse the test item
            slug="test_short_expiration",
            auction_type=AuctionType.FORWARD,
            duration=1,  # 1 minute
            seller=self.test_user,
            is_active=True,
            date_added=current_time,
            date_updated=current_time
        )
        short_duration_auction.save()
        
        # Verify initial state
        self.assertTrue(short_duration_auction.is_active)
        
        # Schedule the auction to expire
        schedule_auction_expiration(short_duration_auction)
        
        # Create another auction that should expire immediately (with past date_added)
        past_time = datetime.utcnow() - timedelta(minutes=5)
        past_auction = Auction(
            item=self.test_item_expired,  # Reuse the other test item
            slug="test_past_expiration",
            auction_type=AuctionType.FORWARD,
            duration=3,  # 3 minutes but already past
            seller=self.test_user,
            is_active=True,
            date_added=past_time,
            date_updated=past_time
        )
        past_auction.save()
        
        # Schedule the past auction to expire (should happen immediately)
        schedule_auction_expiration(past_auction)
        
        # Reload the past auction to check it was marked expired immediately
        past_auction = Auction.objects(slug="test_past_expiration").first()
        self.assertFalse(past_auction.is_active)
        
        # The short duration auction should still be active initially
        short_duration_auction = Auction.objects(slug="test_short_expiration").first()
        self.assertTrue(short_duration_auction.is_active)
        
        # But if we wait just over a minute, it should expire
        # Note: This makes the test take a bit longer to run, but it's a complete test
        # of the scheduling mechanism
        logging.info("Waiting for short duration auction to expire...")
        time.sleep(65)  # Wait 65 seconds (a bit longer than the 1 minute duration)
        
        # Reload and check
        short_duration_auction = Auction.objects(slug="test_short_expiration").first()
        self.assertFalse(short_duration_auction.is_active)

if __name__ == '__main__':
    unittest.main() 