# Validate request arguments
from ..models import Auction
from flask import jsonify, request


def validate_price(f):
    # TODO complete the authorization check
    def wrapper(*args, **kwargs):
        data = request.json

        name = data["name"]
        price = data["price"]
        status = data["status"]
        category = data["category"]

        slug = data["slug"]
        duration = data["duration"]
        auction_type = data["type"]

        # validate the data for item and auction
        #   name should be a string
        #   price should be >= 0
        #   duration should be > 0
        #   status should be boolean
        #   category should be a string
        #   slug should be unique in db
        #   auction_type should be "Dutch" or "Forward"

        if type(name) is not str:
            return jsonify({"message": "Name must be a string"}), 400
        if price <= 0:
            return jsonify({"message": "Price must be non-negative"}), 400
        if duration < 0:
            return jsonify({"message": "Duration must be non-negative"}), 400
        if type(status) is not bool:
            return jsonify({"message": "Status must be boolean"}), 400
        if type(category) is not str:
            return jsonify({"message": "Category must be a string"}), 400
        if ~Auction.objects(slug=slug).first():
            return jsonify({"message": "Slug must be unique"}), 400
        if (auction_type != "Dutch") or (auction_type != "Forward"):
            return jsonify({"message": "Type must be 'Dutch' or 'Forward'"}), 400
        return f(*args, **kwargs)

    wrapper.__name__ = f.__name__
    return wrapper
