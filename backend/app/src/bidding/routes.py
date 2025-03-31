from . import bidding
from flask import jsonify, abort, request
from ...models import *
from backend.database import *
from datetime import datetime
from flask_jwt_extended import current_user, jwt_required
import json

@bidding.route('/forward/<slug>', methods=['POST'])
@jwt_required()
def bid_forward(slug):
    user = current_user

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
    auction.date_updated = datetime.utcnow()
    auction.save()


    # Create a new Sale object.
    bid = Bid(
        user=user,           # logged in buyer
        event_type=EventType.BID,   # type of event
        time=datetime.utcnow(),
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
@jwt_required()
def buyNow_Dutch(slug):
    auction = Auction.objects(slug=slug).first()
    if not auction:
        abort(404, description="Auction not found.")
    if not auction.is_active:
        return jsonify({"error": "Auction is no longer active."}), 400

    # Mark the auction as inactive and update the timestamp
    auction.is_active = False
    auction.date_updated = datetime.utcnow()
    auction.save()

    sale_price = auction.item.price

    # Create a Bid object (similar to forward auction)
    bid = Bid(
        user=current_user,
        event_type=EventType.BID,
        time=datetime.utcnow(),
        price=sale_price,
        auction=auction,
    )
    bid.save()
    auction.bids.append(bid)

    # Link the bid to the auction
    auction.event = bid
    auction.save()

    # Also emit an auction_won event for immediate notification
    try:
        from backend.app import redis_client
        
        # Get auction details for the notification
        auction_data = auction.to_json()
        
        # Create a more detailed event specifically for the winner
        won_event_data = {
            'auction_id': auction.get_id(),
            'auction_slug': auction.slug,  # Add slug for easier lookup
            'winner_id': current_user.get_id(),
            'final_price': sale_price,
            'auction': auction_data
        }
        
        # Publish the auction_won event
        redis_client.publish('auction_won', json.dumps(won_event_data))
        print(f"Published direct auction_won event for Dutch auction: {won_event_data}")
    except Exception as e:
        print(f"Error publishing auction_won event: {e}")

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
