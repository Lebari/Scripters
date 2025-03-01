from . import bidding
from flask import jsonify, abort
from ...models import Auction, Item
from backend.database import *


@bidding.route('/<slug>', methods=['GET'])
def show_auction(slug):
    
    auction = Auction.objects(slug=slug).first()
    print(slug)
    if not auction:
        abort(404)

    auction_data = auction.to_json()
    return auction_data, 200


@bidding.route("/dutch", methods=["GET"])
def hello_bidding_dutch():
    print("Hello from Auth")
    return jsonify({"message": "Hello from dutch bidding"}), 201

@bidding.route("/forward", methods=["GET"])
def hello_bidding_forward():
    print("Hello from Auth")
    return jsonify({"message": "Hello from forward bidding"}), 201

@bidding.route("/", methods=["GET"])
def hello_bidding():
    print("Hello from Auth")
    return jsonify({"message": "Hello from bidding"}), 201
