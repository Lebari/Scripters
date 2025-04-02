from . import auth
from ...models import User

from flask import jsonify, request
from ..validations import validate_new_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import unset_jwt_cookies, create_access_token, jwt_required


@auth.route("/signup", methods=["POST"])
@validate_new_user
def signup():
    print("Hello from signup")
    data = request.json

    try:
        username = data["username"]
        user = User.objects(username=username).first()
        if user:
            return jsonify({"error": "Username already exists"}), 400

        new_user = User(
            fname = data["fname"],
            lname = data["lname"],
            username = username,
            password = generate_password_hash(data["password"]),

            is_seller = False,
            streetno = data["streetno"],
            street = data["street"],
            city = data["city"],
            country = data["country"],
            postal = data["postal"],
        )
        new_user.save()

        return jsonify({"message": "New user created. Please sign in."}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@auth.route("/login", methods=["POST"])
def login():
    print("Hello from login")
    print(f"request {request} .data {request.data}")
    data = request.json

    try:
        username = data["username"]
        user = User.objects(username=username).first()
        password = check_password_hash(user.password, data["password"])

        if user and password:
            token = create_access_token(identity=username)
            print(token)
            return jsonify({"token": token}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


