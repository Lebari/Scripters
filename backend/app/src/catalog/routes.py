from . import catalog
from flask import jsonify


@catalog.route("/", methods=["GET"])
def hello_catalog():
    print("Hello from Catalog")
    return jsonify({"message": "Hello from Catalog"}), 201
