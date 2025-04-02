from . import search
from flask import jsonify, abort, request
from ...models import *
from bson import ObjectId
from mongoengine import Q


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
    print("hellow from search items")
    data = request.args
    if not data or "keyword" not in data:
        return jsonify({"error": "Missing 'keyword' in JSON payload."}), 400

    keyword = data["keyword"]

    # build query for items
    queryI = Q(name__icontains=keyword)
    duration = 0
    try:
        # if keyword is an int, try finding auctions with that price or duration
        price = int(keyword)
        duration = int(keyword)
        if price:
            queryI |= Q(price=price)
    except:
        pass

    # Step 1: Query Items that match the keyword (case-insensitive)
    matching_items = Item.objects(queryI)
    if not matching_items:
        return jsonify({"status": "success", "auctions": []}), 200

    item_ids = [item.id for item in matching_items]

    # build query for auction
    query = Q(item__in=item_ids)
    active = request.args.get('active', 0, type=int)  # Get only active auctions (default to false)
    if active:
        query &= Q(is_active=True)
    if duration:
        query |= Q(duration=duration)

    # Step 2: Query active Auctions that reference one of these Items
    auctions = Auction.objects(query)

    # Serialize the auctions using a method like json_formatted()
    auctions_json = [auction.to_json() for auction in auctions]
    
    return jsonify({"status": "success", "auctions": auctions_json}), 200


@search.route("/<auction_id>", methods=["GET"])
def get_auction_by_id(auction_id):
    """
    Get auction details by ID
    This is specifically used by the notification system to retrieve auction details
    """
    try:
        # Try to convert the string ID to a MongoDB ObjectId
        object_id = ObjectId(auction_id)

        # Retrieve the auction using its ID
        auction = Auction.objects(id=object_id).first()

        if not auction:
            return jsonify({"error": "Auction not found"}), 404

        # Return the auction details
        auction_data = auction.to_json()
        return jsonify({"status": "success", "auction": auction_data}), 200
    except Exception as e:
        # In case of error (invalid ID format, etc.)
        return jsonify({"error": str(e)}), 400