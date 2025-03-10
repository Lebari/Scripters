from . import bidding
from flask import jsonify, abort, request
from ...models import *
from backend.database import *
from datetime import datetime
from flask_login import current_user, login_required

@bidding.route('/forward/<slug>', methods=['POST'])
def bid_forward(slug):
    # this line is temporary for testing needs to be modified later
    user = User.objects(fname="Jane").first() 

    auction = Auction.objects(slug=slug).first()

    if not auction:
        abort(404, description="Auction not found.")
    if not auction.is_active:
        return jsonify({"error": "Auction is no longer active."}), 400

    # Get JSON payload and extract the price for sale
    data = request.get_json()
    if not data or "price" not in data:
        return jsonify({"error": "Missing price in request payload."}), 400
    bid_price = data["price"]

    print(auction.event)
    if(not auction.event is None and bid_price <= auction.event.price):
        return jsonify({"error": "New bid must be higher than the old bid."}), 400

    # Mark the auction as inactive and update the timestamp
    auction.date_updated = datetime.now()
    auction.save()


    # Create a new Sale object.
    bid = Bid(
        user=user,           # logged in buyer
        event_type=EventType.BID,   # type of event
        time=datetime.now(),
        price=bid_price,
        auction=auction,
    )
    bid.save()
    auction.bids.append(bid)

    # Link the sale to the auction.
    auction.event = bid
    auction.save()

    return jsonify({"status": "success", "payment_url": "----"}), 200

@bidding.route('/dutch/<slug>', methods=['POST'])
@login_required
def buyNow_Dutch(slug):
    auction = Auction.objects(slug=slug).first()
    if not auction:
        abort(404, description="Auction not found.")
    if not auction.is_active:
        return jsonify({"error": "Auction is no longer active."}), 400

    # Mark the auction as inactive and update the timestamp
    auction.is_active = False
    auction.date_updated = datetime.now()
    auction.save()

    # Get JSON payload and extract the price for sale
    data = request.get_json()
    if not data or "price" not in data:
        return jsonify({"error": "Missing price in request payload."}), 400
    sale_price = data["price"]

    # Create a new Sale object.
    bid = Bid(
        user=current_user,           # logged in buyer
        event_type=EventType.SALE,   # type of event
        time=datetime.now(),
        price=sale_price,
        auction=auction,
    )
    bid.save()

    # Link the sale to the auction.
    auction.event = bid
    auction.save()

    current_user.purchases.append(bid.id)
    current_user.save()

    return jsonify({"status": "success", "payment_url": "----"}), 200


@bidding.route("/dutch", methods=["GET"])
def hello_bidding_dutch():
    print("Hello from Auth")
    return jsonify({"message": "Hello from dutch bidding"}), 201

@bidding.route("/forward", methods=["GET"])
def hello_bidding_forward():
    print("Hello from Auth")
    return jsonify({"message": "Hello from forward bidding"}), 201

@bidding.route("/", methods=["GET"])
def hello_bidding():
    print("Hello from Auth")
    return jsonify({"message": "Hello from bidding"}), 201
