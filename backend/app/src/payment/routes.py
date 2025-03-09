from flask import Blueprint, jsonify, request, abort
from flask_login import login_required, current_user
from ...models import Payment, Auction
import uuid
import datetime

payment_bp = Blueprint("payment", __name__)

@payment_bp.route("/test", methods=["GET"])
def test_payment():
    """Test endpoint to check if the payment service is running"""
    return jsonify({"message": "Hi"}), 200

import datetime
import uuid
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

payment_bp = Blueprint("payment", __name__)

@payment_bp.route("/payment", methods=["POST"])
@login_required
def process_payment():
    """Process payment for an auction item"""
    print(f"Processing payment for user: {current_user.username}")

    try:
        data = request.get_json()
        required_fields = ["auction_id", "card_number", "card_name", "exp_date", "security_code"]
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required payment details"}), 400

        auction_id = data["auction_id"]
        auction = Auction.objects(id=auction_id).first()

        if not auction:
            return jsonify({"error": "Auction not found"}), 404
        
        if auction.is_active:
            print(f"Auction {auction_id} is still active")
            return jsonify({"error": "Auction is still active, cannot process payment"}), 403
        
        print("Auction is inactive, retrieving highest bid...")

        bid_events = Event.objects(id__in=auction.bids) 

        return jsonify({
            "message": "Auction is inactive. Proceeding with payment...",
        })

    except Exception as e:
        print(f"Payment processing error: {str(e)}")
        return jsonify({"error": str(e)}), 400
