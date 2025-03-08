from . import catalog
from ..validations import validate_new_auction, seller_required
from ...models import Auction, Item, User, AuctionType
from flask import jsonify, request
from datetime import datetime
from flask_login import current_user


@catalog.route("/", methods=["GET"])
def get_all_auctions():
    print("Hello from get_all_auctions!")
    # return all auctions
    auctions = Auction.objects()
    auctions_json = []
    for auction in auctions:
        auctions_json.append(auction.to_json())

    return jsonify({"All Auctions": auctions_json}), 201


@catalog.route("/<slug>", methods=["GET"])
def get_auction(slug):
    print("Hello from get_auction!")
    # return auction with specified slug
    auction = Auction.objects(slug=slug).first().to_json()

    if auction is None:
        return jsonify({"error": "Invalid slug"}), 400

    return jsonify({"auction": auction}), 201


@catalog.route("/upload", methods=["POST"])
# TODO add seller user type authorization check
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
            seller = User.objects(id=data["seller"]).first(),
            is_active = True,
            date_added = datetime.now()
        )
        new_auction.save()

        return jsonify({"message": "New auction uploaded"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@catalog.route("/<slug>/dutch-update", methods=["PATCH"])
@seller_required
def update_dutch_auction(slug):
    print("Hello from update_dutch_auction")

    try:
        # Retrieve auction from database
        auction = Auction.objects(slug=slug).first()
        # get price from json
        new_price = request.json["price"]

        if new_price < 0:
            return jsonify({"error": "Price must be non-negative."}), 400
        if auction.auction_type != AuctionType.DUTCH:
            return jsonify({"error": "Auction must be of type dutch."}), 400
        if not auction.is_active:
            return jsonify({"error": "Auction must be active to update."}), 400
        if current_user.id != auction.seller.id:
            return jsonify({"error": "User is not auction's seller."}), 400

        item = Item.objects(id=auction.item.id).first()
        item.price = new_price
        item.save()

        return jsonify({"message": "Auction price updated"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
