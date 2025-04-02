from . import user

from flask import jsonify
from flask_jwt_extended import current_user, jwt_required


@user.route("/user", methods=["GET"])
@jwt_required()
def get_user():
    print("Hello from get_user")
    try:
        return jsonify({"user": current_user.to_json()}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@user.route("/me", methods=["GET"])
@jwt_required()
def get_user_auctions():
    print("Hello from get_user_auctions")
    try:
        # return all user's auctions
        auctions = current_user.auctions

        auctions_json = []
        for auction in auctions:
            auctions_json.append(auction.to_json())

        return jsonify({"auctions": auctions_json}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@user.route("/become_seller", methods=["PATCH"])
@jwt_required()
def become_seller():
    print("Hello from become_seller")
    try:
        current_user.is_seller = True
        current_user.save()
        return jsonify({"message": "User now has seller access"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@user.route("/remove_seller", methods=["PATCH"])
@jwt_required()
def remove_seller():
    print("Hello from remove_seller")
    try:
        current_user.is_seller = False
        current_user.save()
        return jsonify({"message": "User no longer has seller access"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
