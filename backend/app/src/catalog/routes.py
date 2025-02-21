from . import catalog
from ..validations import validate_price
from ...models import Auction, Item
from flask import jsonify, request
from datetime import datetime


@catalog.route("/", methods=["GET"])
def hello_catalog():
    print("Hello from Catalog")
    return jsonify({"message": "Hello from Catalog"}), 201


@catalog.route("/upload", methods=["POST"])
# TODO add seller user type authorization check
@validate_price
def upload_auction():
    print("Hello from upload_auction")
    data = request.json

    try:
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
            type = data["type"],
            duration = data["duration"],
            seller = data["seller"],
            date_added = datetime.now()
        )
        new_auction.save()

        return jsonify({"message": "New auction uploaded"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@catalog.route("/<slug>/dutch-update", methods=["PATCH"])
# TODO add seller user type authorization check
def update_dutch_auction(slug):
    print("Hello from update_dutch_auction")

    try:
        # get price from json
        new_price = request.json["price"]

        if new_price < 0:
            return jsonify({"error": "Price must be non-negative."}), 400

        # Retrieve auction from database
        auction = Auction.objects(slug=slug).first()

        #verify that auction is a dutch auction
        if auction.type == "dutch":
            auction.price = new_price
            auction.save()
        else:
            return jsonify({"error": "Auction must be of type dutch."}), 400
        return jsonify({"message": "Auction price updated"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
