from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, current_user
from bson import ObjectId
from ...models import Payment, Auction, Event
from datetime import datetime

payment_bp = Blueprint("payment", __name__)

@payment_bp.route("/test", methods=["GET"])
def test_payment():
    """Test endpoint to check if the payment service is running"""
    return jsonify({"message": "Hi"}), 200

@payment_bp.route("/payment", methods=["POST"])
@jwt_required()
def process_payment():
    """Process payment for an auction item"""
    try:
        data = request.get_json()
        required_fields = ["auction_id", "card_number", "card_name", "exp_date", "security_code"]
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required payment details"}), 400

        auction_id = data["auction_id"]
        
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

        shipping_address = f"{current_user.streetno} {current_user.street}, {current_user.city}, {current_user.country} {current_user.postal}" 

        payment = Payment(
            user=current_user,
            auction=auction,
            amount=event_object.price, 
            status="Success",
            timestamp=datetime.utcnow(),
            shipping_address=shipping_address  # Concatenated address from user object
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

@payment_bp.route("/receipt", methods=["POST"])
@jwt_required()
def generate_receipt():
    """Generate a receipt for a completed payment"""
    try:
        data = request.get_json()
        if "purchase_id" not in data:
            return jsonify({"error": "Missing purchase_id"}), 400

        purchase_id = data["purchase_id"]
        dbref_list = current_user.purchases
        id_found = None
        for ref in dbref_list:
            if str(ref.id) == str(purchase_id):
                id_found = str(ref.id)
                break

        if not id_found:
            return jsonify({"error": "Purchase ID not found in user's purchases"}), 404
        
        payment = Payment.objects(id=id_found).first()
        if not payment:
            return jsonify({"error": "Payment record not found"}), 404

        receipt = {
            "purchase_id": id_found,
            "user_name": f"{current_user.fname} {current_user.lname}",
            "auction_id": str(payment.auction.id),
            "amount_paid": payment.amount,
            "shipping_address": payment.shipping_address,
            "delivery_estimate": f"{7} business days"
        }

        return jsonify({
            "message": "Purchase Receipt",
            "receipt": receipt
        })

    except Exception as e:
        print(f"Receipt generation error: {str(e)}")
        return jsonify({"error": str(e)}), 400
