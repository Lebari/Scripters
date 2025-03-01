from . import sale
from flask import jsonify


@sale.route("/", methods=["GET"])
def hello_sale():
    print("Hello from Sale")
    return jsonify({"message": "Hello from Sale"}), 201

