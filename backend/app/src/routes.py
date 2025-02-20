from . import src
from flask import jsonify


@src.route("/", methods=["GET"])
def hello_src():
    print("Hello from Main")
    return jsonify({"message": "Hello from Main"}), 201