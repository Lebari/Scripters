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

@payment_bp.route("/", methods=["GET"])
@login_required
def get_payment_history():
    """Retrieve the payment history of the logged-in user"""
    try:
        payments = Payment.objects(user=current_user.id)
        payments_list = [payment.to_json() for payment in payments]

        return jsonify({"status": "success", "payments": payments_list}), 200
    except Exception as e:
        abort(500, description=str(e))

@payment_bp.route("/", methods=["POST"])
@login_required
def process_payment():
    """Mock payment processing for an auction item"""
    data = request.get_json()
    print(data)

    if not data or "auction_id" not in data:
        return jsonify({"error": "Missing 'auction_id' in JSON payload."}), 400

    auction_id = data["auction_id"]

    try:
        auction = Auction.objects(id=auction_id).first()
        if not auction:
            return jsonify({"error": "Auction not found"}), 404

        if auction.winner.id != current_user.id:
            return jsonify({"error": "You are not the winner of this auction"}), 403

        total_amount = auction.final_price + auction.shipping_cost

        payment_id = str(uuid.uuid4())
        mock_payment = Payment(
            user=current_user.id,
            auction=auction.id,
            amount=total_amount,
            status="Success",
            payment_id=payment_id,
            timestamp=datetime.datetime.utcnow()
        )
        mock_payment.save()

        auction.payment_status = "Paid"
        auction.save()

        return jsonify({
            "status": "success",
            "message": "Mock payment successful",
            "payment_id": payment_id
        }), 200

    except Exception as e:
        abort(500, description=str(e))
