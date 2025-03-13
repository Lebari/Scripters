from . import catalog
import logging
import json
from ..validations import validate_new_auction, seller_required
from ...models import Auction, Item, AuctionType
from flask import jsonify, request
from datetime import datetime
from flask_jwt_extended import jwt_required, current_user


@catalog.route("/", methods=["GET"])
def get_all_auctions():
    print("Hello from get_all_auctions!")
    # return all auctions
    auctions = Auction.objects()
    auctions_json = []
    for auction in auctions:
        auctions_json.append(auction.to_json())

    return jsonify({"auctions": auctions_json}), 201


@catalog.route("/<slug>", methods=["GET"])
def get_auction(slug):
    print("Hello from get_auction!")
    # return auction with specified slug
    auction = Auction.objects(slug=slug).first().to_json()

    if auction is None:
        return jsonify({"error": "Invalid slug"}), 400

    return jsonify({"auction": auction}), 201


@catalog.route("/upload", methods=["POST"])
@jwt_required()
@validate_new_auction
def upload_auction():
    print("Hello from upload_auction")

    try:
        data = request.json
        # create item
        new_item = Item(
            name = data["name"],
            price = data["price"],
            status = data["status"],
            category = data["category"]
        )
        new_item.save()

        # create auction
        new_auction = Auction(
            item = new_item,
            slug = data["slug"],
            auction_type = data["auction_type"],
            duration = data["duration"],
            seller = current_user,
            is_active = True,
            date_added = datetime.now()
        )
        new_auction.save()

        # ensure some user is logged in
        if not current_user:
            return jsonify({"error": "Please log in first"})

        # if it is user's first auction, make them a seller
        if len(current_user.auctions) == 0:
            current_user.is_seller = True
            current_user.save()
            print("User is now a seller")

        # add auction to seller's list of auctions
        current_user.auctions.append(new_auction.id)
        current_user.save()

        return jsonify({"message": "New auction uploaded"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


from backend.app import redis_client  # Ensure redis_client is imported from your app

@catalog.route("/<slug>/dutch-update", methods=["PATCH"])
@jwt_required()
@seller_required
def update_dutch_auction(slug):
    print("Hello from update_dutch_auction")

    try:
        # Retrieve auction from database
        auction = Auction.objects(slug=slug).first()
        if not auction:
            return jsonify({"error": "Auction not found."}), 404

        # Get the new price from JSON request body
        new_price = request.json.get("price")
        if new_price is None:
            return jsonify({"error": "Price is required."}), 400

        if new_price < 0:
            return jsonify({"error": "Price must be non-negative."}), 400

        if auction.auction_type != AuctionType.DUTCH:
            return jsonify({"error": "Auction must be of type dutch."}), 400

        if not auction.is_active:
            return jsonify({"error": "Auction must be active to update."}), 400

        if current_user.id != auction.seller.id:
            return jsonify({"error": "User is not auction's seller."}), 400

        # Update the item price
        item = Item.objects(id=auction.item.id).first()
        if not item:
            return jsonify({"error": "Item not found."}), 404

        item.price = new_price
        item.save()

        # Publish a price update event to Redis for frontend notification
        event_data = {
            'auction_id': auction.get_id(),
            'new_price': new_price,
            'updated_at': datetime.now().timestamp()
        }
        try:
            redis_client.publish('auction_price_changed', json.dumps(event_data))
            print("--------------------alsdkhasldhalsdkhaosdhalskd")
            logging.info(f"Published price update event: {event_data}")
        except Exception as pub_err:
            logging.error(f"Error publishing price update event: {pub_err}")

        return jsonify({"message": "Auction price updated"}), 201
    except Exception as e:
        logging.error(f"Error in update_dutch_auction: {e}")
        return jsonify({"error": str(e)}), 400

