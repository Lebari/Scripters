from flask import Blueprint

sale = Blueprint("sale", __name__, url_prefix="/sale")

from . import routes
