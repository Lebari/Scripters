from . import auth
from ...models import User

from flask import jsonify, request
from ..validations import validate_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import unset_jwt_cookies, create_access_token, jwt_required, current_user


@auth.route("/signup", methods=["POST"])
@validate_user
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

        return jsonify({"message": "New user created"}), 201
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


@auth.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    print("Hello from logout")
    try:
        token = request.headers.get("Authorization").split(" ")[1]

        print(f"current_user.username {current_user}")

        response = jsonify({"message": "Sign out successful"})
        unset_jwt_cookies(response)
        return response, 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@auth.route("/become_seller", methods=["PATCH"])
@jwt_required()
def become_seller():
    print("Hello from become_seller")
    try:
        user = current_user
        user.is_seller = True
        user.save()
        return jsonify({"message": "User now has seller access"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@auth.route("/remove_seller", methods=["PATCH"])
@jwt_required()
def remove_seller():
    print("Hello from remove_seller")
    try:
        user = current_user
        user.is_seller = False
        user.save()
        return jsonify({"message": "User no longer has seller access"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
