from flask import Blueprint

catalog = Blueprint("catalog", __name__, url_prefix="/catalog")
from . import routes
