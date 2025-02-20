from . import catalog
from ...models import Auction, Item
from flask import jsonify, request


@catalog.route("/", methods=["GET"])
def hello_catalog():
    print("Hello from Catalog")
    return jsonify({"message": "Hello from Catalog"}), 201


@catalog.route("/upload", methods=["POST"])
# TODO add seller authorization check
def upload_auction():
    print("Hello from upload_auction")

    try:
        # get arguments from json
        data = request.json

        # TODO add more args validations
        # create item
        new_item = Item(
            name = data["item_name"],
            price = data["item_price"],
            status = data["item_status"],
            category = data["item_category"]
        )
        new_item.save()

        #create auction
        new_auction = Auction(
            name = data["name"],
            duration = data["duration"],
            item = new_item,
            type = data["type"],
            seller = data["seller"]
        )
        new_auction.save()

        return jsonify({"message": "New auction uploaded"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@catalog.route("/dutch-update", methods=["PUT"])
# TODO add seller authorization check
def update_dutch_auction():
    print("Hello from update_dutch_auction")

    try:
        # get price from json
        new_price = request.json["price"] # TODO add more args validations
        auction_id = request.json["auction_id"]

        # Retrieve auction from database
        auction = Auction.objects(id=auction_id).first()
        auction.price = new_price
        auction.save()

        return jsonify({"message": "Auction price updated"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
