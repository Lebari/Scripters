from . import auth
from flask import jsonify, request

from ..validations import validate_user
from ...models import Seller


@auth.route("/", methods=["GET"])
def hello_auth():
    print("Hello from Auth")
    return jsonify({"message": "Hello from Auth"}), 201


@auth.route("/seller/signup", methods=["POST"])
@validate_user
def seller_signup():
    print("Hello from seller_signup")
    data = request.json

    try:
        # create seller
        new_seller = Seller(
            fname = data["fname"],
            lname = data["lname"],
            username = data["username"],
            password = data["password"],  # TODO password encryption
        )
        new_seller.save()

        return jsonify({"message": "New seller uploaded"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@auth.route("/seller/login", methods=["GET"])
@validate_user
def seller_login():
    print("Hello from seller_login")
    data = request.json

    try:
        #TODO complete seller login

        return jsonify({"message": "New seller uploaded"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400