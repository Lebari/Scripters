from flask import Blueprint

bidding = Blueprint("bidding", __name__, url_prefix="/bid")
from . import routes
