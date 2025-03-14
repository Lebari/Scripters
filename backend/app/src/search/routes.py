from . import search
from flask import jsonify, abort, request
from ...models import *


@search.route("/", methods=["GET"])
def return_all():
    try:
        # Retrieve all Auction documents
        auctions = Auction.objects()
        # Serialize each auction using its to_json or json_formatted method
        auctions_list = [auction.to_json() for auction in auctions]
        return jsonify({"status": "success", "auctions": auctions_list}), 200
    except Exception as e:
        # In case of error, return a 500 error response
        abort(500, description=str(e))


@search.route("/", methods=["POST"])
def search_items():

    data = request.get_json()
    if not data or "keyword" not in data:
        return jsonify({"error": "Missing 'keyword' in JSON payload."}), 400

    keyword = data["keyword"]

    # Step 1: Query Items that match the keyword (case-insensitive)
    matching_items = Item.objects(name__icontains=keyword)
    if not matching_items:
        return jsonify({"status": "success", "results": []}), 200

    item_ids = [item.id for item in matching_items]

    # Step 2: Query Auctions that reference one of these Items
    auctions = Auction.objects(item__in=item_ids)

    # Serialize the results using a method like json_formatted()
    results = [auction.to_json() for auction in auctions]
    
    return jsonify({"status": "success", "results": results}), 200