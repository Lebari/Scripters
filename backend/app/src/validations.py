# Validate request arguments
from enum import StrEnum

from ..models import Auction
from flask import jsonify, request


class AuctionType(StrEnum):
    DUTCH = "Dutch",
    FORWARD = "Forward"


def validate_new_auction(f):
    # TODO complete the authorization check
    def wrapper(*args, **kwargs):
        data = request.json

        name = data["name"]
        price = data["price"]
        status = data["status"]
        category = data["category"]

        slug = data["slug"]
        duration = data["duration"]
        auction_type = data["auction_type"]

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
            return jsonify({"message": "Price must be a positive Integer"}), 400
        if duration <= 0:
            return jsonify({"message": "Duration must be a positive Integer"}), 400
        if type(status) is not bool:
            return jsonify({"message": "Status must be boolean"}), 400
        if type(category) is not str:
            return jsonify({"message": "Category must be a string"}), 400
        if Auction.objects(slug=slug).first() is not None:
            return jsonify({"message": "Slug must be unique"}), 400
        if (auction_type != AuctionType.DUTCH) and (auction_type != AuctionType.FORWARD.value):
            return jsonify({"message": "Type must be 'Dutch' or 'Forward'"}), 400
        return f(*args, **kwargs)

    wrapper.__name__ = f.__name__
    return wrapper
