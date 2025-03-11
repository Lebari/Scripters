# Validate request arguments

from ..models import Auction, AuctionType

import jwt
from ..models import User
from flask import request, jsonify
from flask_jwt_extended import create_access_token, decode_token


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


def validate_user(f):
    # Validate attributes to create new user
    def wrapper(*args, **kwargs):
        data = request.json

        fname = data["fname"]
        lname = data["lname"]
        username = data["username"]
        password = data["password"]

        # validate the data for a new user
        #   fname should be a non-empty string
        #   lname should be a non-empty string
        #   username should be a non-empty string
        #   password should be a non-empty string

        if type(fname) is not str or str.isspace(fname):
            return jsonify({"message": "First Name must be a non-empty string"}), 400
        if type(lname) is not str or str.isspace(lname):
            return jsonify({"message": "Last Name must be a non-empty string"}), 400
        if type(username) is not str or str.isspace(username):
            return jsonify({"message": "Username must be a non-empty string"}), 400
        if type(password) is not str or str.isspace(password):
            return jsonify({"message": "Password must be a non-empty string"}), 400

        return f(*args, **kwargs)

    wrapper.__name__ = f.__name__
    return wrapper


# Token generation and retrieval
def generate_token(username):
    uname_object = {"username": username}
    token = create_access_token(identity=uname_object)
    return token


def seller_required(f):
    def wrapper(*args, **kwargs):
        print("CHECKING IF SELLER")
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": "Token is missing!"}), 403

        try:
            # Get user from token and check if user exists
            print(token)
            user = get_user_from_token(token)
            if not user.is_seller:
                return jsonify({"message": "User is not a seller."}), 403

        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired."}), 403
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token."}), 403

        return f(*args, **kwargs)

    wrapper.__name__ = f.__name__
    return wrapper


def login_required(f):
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": "Token is missing."}), 403

        try:
            # Get user from token and check if user exists
            print(token)
            user = get_user_from_token(token)
            if user is None:
                return jsonify({"message": "Invalid user token, user not found"}), 400

        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired."}), 403
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token."}), 403

        return f(*args, **kwargs)

    wrapper.__name__ = f.__name__
    return wrapper


def get_user_from_token(token):
    # return user from token, or from request data
    print(f"token: {token}")
    username = decode_token(token.split(" ")[1])
    user = User.objects(username=username).first()

    if user is None:
        data = request.json
        return User.objects(username=data.get("username")).first()
    return user
