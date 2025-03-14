# Validate request arguments

from ..models import Auction, AuctionType

import jwt
from flask import request, jsonify
from flask_jwt_extended import get_current_user


def validate_new_auction(f):
    # Validate attributes for creating a new auction
    def wrapper(*args, **kwargs):
        data = request.json

        name = data["name"]
        price = int(data["price"])
        status = data["status"]
        category = data["category"]

        slug = data["slug"]
        duration = int(data["duration"])
        auction_type = data["auction_type"]

        print(f"typ {auction_type}")

        # validate the data for item and auction
        #   name should be a string
        #   price should be >= 0
        #   duration should be > 0
        #   status should be boolean
        #   category should be a string
        #   slug should be unique in db
        #   auction_type should be "Dutch" or "Forward"

        if not name or type(name) is not str:
            return jsonify({"message": "Name must be a non-empty string"}), 400
        if price <= 0:
            return jsonify({"message": "Price must be a positive Integer"}), 400
        if duration <= 0:
            return jsonify({"message": "Duration must be a positive Integer"}), 400
        if not status or type(status) is not bool:
            return jsonify({"message": "Status must be boolean"}), 400
        if not category or type(category) is not str:
            return jsonify({"message": "Category must be a non-empty string"}), 400
        if Auction.objects(slug=slug).first() is not None:
            return jsonify({"message": "Slug must be unique"}), 400
        if (auction_type != AuctionType.DUTCH) and (auction_type != AuctionType.FORWARD.value):
            return jsonify({"message": "Type must be 'Dutch' or 'Forward'"}), 400
        return f(*args, **kwargs)

    wrapper.__name__ = f.__name__
    return wrapper


def validate_new_user(f):
    # Validate attributes to create new user
    def wrapper(*args, **kwargs):
        data = request.json

        fname = data["fname"]
        lname = data["lname"]
        username = data["username"]
        password = data["password"]
        streetno = int(data["streetno"])
        street = data["street"]
        city = data["city"]
        country = data["country"]
        postal = data["postal"]

        # validate the data for a new user
        #   fname should be a non-empty string
        #   lname should be a non-empty string
        #   username should be a non-empty string
        #   password should be a non-empty string

        if type(fname) is not str or not fname:
            return jsonify({"message": "First Name must be a non-empty string"}), 400
        if type(lname) is not str or not lname:
            return jsonify({"message": "Last Name must be a non-empty string"}), 400
        if type(username) is not str or not username:
            return jsonify({"message": "Username must be a non-empty string"}), 400
        if type(password) is not str or not password:
            return jsonify({"message": "Password must be a non-empty string"}), 400
        if type(streetno) is not int or not data["streetno"]:
            return jsonify({"message": "Streetno must be a non-empty int passed as a string"}), 400
        if type(street) is not str or not street:
            return jsonify({"message": "Street must be a non-empty string"}), 400
        if type(city) is not str or not city:
            return jsonify({"message": "City must be a non-empty string"}), 400
        if type(country) is not str or not country:
            return jsonify({"message": "Country must be a non-empty string"}), 400
        if type(postal) is not str or not postal:
            return jsonify({"message": "Postal must be a non-empty string"}), 400

        return f(*args, **kwargs)

    wrapper.__name__ = f.__name__
    return wrapper


def seller_required(f):
    def wrapper(*args, **kwargs):
        print("CHECKING IF SELLER")
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": "Token is missing!"}), 403

        try:
            token = token.split(" ")[1] # remove the Bearer tag from token
            # Get user from token and check if user exists
            print(f"from seller_required {token}")
            user = get_current_user()
            # user = get_user_from_token(token)
            if not user.is_seller:
                return jsonify({"message": "User is not a seller."}), 403

        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired."}), 403
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token."}), 403

        return f(*args, **kwargs)

    wrapper.__name__ = f.__name__
    return wrapper
