from . import bidding
from flask import jsonify, abort, request
from ...models import *
from datetime import datetime
from flask_jwt_extended import current_user, jwt_required


@bidding.route('/forward/<slug>', methods=['POST'])
@jwt_required()
def bid_forward(slug):
    auction = Auction.objects(slug=slug).first()

    if not auction:
        abort(404, description="Auction not found.")
    if not auction.is_active:
        return jsonify({"error": "Auction is no longer active."}), 400

    # Get JSON payload and extract the price for sale
    data = request.get_json()
    if not data or "price" not in data:
        return jsonify({"error": "Missing price in request payload."}), 400

    # Get the bid price and ensure it's an integer
    try:
        bid_price = int(data["price"])
        if bid_price != float(data["price"]):
            return jsonify({"error": "Bid price must be a whole number (integer)."}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Bid price must be a valid number."}), 400

    print(auction.event)
    if(not auction.event is None and bid_price <= auction.event.price):
        return jsonify({"error": "New bid must be higher than the old bid."}), 400

    # Mark the auction as inactive and update the timestamp
    auction.date_updated = datetime.now()
    auction.save()

    # Create a new Sale object.
    bid = Bid(
        user=current_user,           # logged in buyer
        event_type=EventType.BID,   # type of event
        time=datetime.now(),
        price=bid_price,
        auction=auction,
    )
    bid.save()
    auction.bids.append(bid.id)

    # Link the sale to the auction.
    auction.event = bid
    auction.save()

    return jsonify({"status": "success", "payment_url": "----"}), 200


@bidding.route('/dutch/<slug>', methods=['POST'])
@jwt_required()
def buyNow_Dutch(slug):
    print(f"[DUTCH AUCTION] Processing Buy Now request for auction slug: {slug}")
    try:
        auction = Auction.objects(slug=slug).first()
        if not auction:
            print(f"[DUTCH AUCTION] Error: Auction with slug {slug} not found")
            abort(404, description="Auction not found.")

        if not auction.is_active:
            print(f"[DUTCH AUCTION] Error: Auction {slug} is no longer active")
            return jsonify({"error": "Auction is no longer active."}), 400

        # Mark the auction as inactive and update the timestamp
        print(f"[DUTCH AUCTION] Marking auction {slug} as inactive")
        auction.is_active = False
        auction.date_updated = datetime.utcnow()
        auction.save()

        sale_price = auction.item.price
        print(f"[DUTCH AUCTION] Sale price for auction {slug}: ${sale_price}")

        # Create a Bid object (similar to forward auction)
        print(f"[DUTCH AUCTION] Creating bid record for user {current_user.username} on auction {slug}")
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
        print(f"[DUTCH AUCTION] Successfully completed Dutch auction {slug}")

        # We're skipping notifications for Dutch auctions as they go directly to the auction-ended page
        # Return successful response
        return jsonify({
            "status": "success",
            "message": "Dutch auction completed successfully",
            "auction_id": auction.get_id(),
            "auction_slug": auction.slug,
            "final_price": sale_price
        }), 200
    except Exception as e:
        print(f"[DUTCH AUCTION] Error processing Buy Now for auction {slug}: {str(e)}")
        return jsonify({"error": f"Failed to process purchase: {str(e)}"}), 500


@bidding.route("/dutch", methods=["GET"])
def hello_bidding_dutch():
    print("Hello from hello_bidding_dutch")
    return jsonify({"message": "Hello from dutch bidding"}), 201


@bidding.route("/forward", methods=["GET"])
def hello_bidding_forward():
    print("Hello from hello_bidding_forward")
    return jsonify({"message": "Hello from forward bidding"}), 201


@bidding.route("/", methods=["GET"])
def hello_bidding():
    print("Hello from hello_bidding")
    return jsonify({"message": "Hello from bidding"}), 201
