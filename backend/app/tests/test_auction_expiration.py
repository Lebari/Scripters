import unittest
from datetime import datetime, timedelta
from backend.app.models import Auction, Item, User, AuctionType
from backend.app.__init__ import check_expired_auctions
from backend.database import init_db
import logging

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
        
        # Run the expiration check
        from backend.app.__init__ import check_expired_auctions
        check_expired_auctions()
        
        # Reload auctions from database
        active_auction = Auction.objects(slug="test_expiration_active").first()
        expired_auction = Auction.objects(slug="test_expiration_expired").first()
        
        # Verify that active auction is still active
        self.assertTrue(active_auction.is_active)
        
        # Verify that expired auction is now inactive
        self.assertFalse(expired_auction.is_active)

if __name__ == '__main__':
    unittest.main() 