from flask import Blueprint, jsonify, request, abort
from flask_login import login_required, current_user
from bson import ObjectId
from ...models import Payment, Auction, Event
import uuid
import json
from datetime import datetime

payment_bp = Blueprint("payment", __name__)

@payment_bp.route("/test", methods=["GET"])
def test_payment():
    """Test endpoint to check if the payment service is running"""
    return jsonify({"message": "Hi"}), 200

@payment_bp.route("/payment", methods=["POST"])
@login_required
def process_payment():
    """Process payment for an auction item"""
    try:
        data = request.get_json()
        required_fields = ["auction_id", "card_number", "card_name", "exp_date", "security_code", "shipping_address"]
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required payment details"}), 400

        auction_id = data["auction_id"]
        shipping_address = data["shipping_address"]

        auction = Auction.objects(id=auction_id).first()

        if not auction:
            return jsonify({"error": "Auction not found"}), 404
        auction_event_list = auction.to_mongo().get("bids", [])

        if not auction_event_list:
            return jsonify({"error": "No bids found for this auction"}), 400

        auction_event_winner_id = auction_event_list[-1]
        event_object = Event.objects(id=auction_event_winner_id).first()

        if not event_object:
            return jsonify({"error": "Winning bid event not found"}), 404
        
        if str(event_object.user.id) == str(current_user.id):
            return jsonify({"error": "You are not the owner who won this bid"}), 403

        payment = Payment(
            user=current_user,
            auction=auction,
            amount=event_object.price, 
            status="Success",
            timestamp=datetime.utcnow(),
            shipping_address=shipping_address
        )

        payment.save()

        current_user.update(push__purchases=payment.id)
        current_user.reload()

        return jsonify({
            "message": "Auction is inactive. Payment completed successfully.",
            "payment": payment.to_json(),
            "user_purchases": [str(p) for p in current_user.purchases]
        })

    except Exception as e:
        print(f"Payment processing error: {str(e)}")
        return jsonify({"error": str(e)}), 400


