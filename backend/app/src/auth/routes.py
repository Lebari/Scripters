from . import auth
from flask import jsonify


@auth.route("/", methods=["GET"])
def hello_auth():
    print("Hello from Auth")
    return jsonify({"message": "Hello from Auth"}), 201
