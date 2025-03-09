from flask import Blueprint

src = Blueprint("src", __name__)

# Blueprints
from .sale import sale as sale_blueprint
from .auth import auth as auth_blueprint
from .user import user as user_blueprint
from .catalog import catalog as catalog_blueprint
from .bidding import bidding as bidding_blueprint
from .search import search as search_blueprint

# register blueprints
src.register_blueprint(sale_blueprint)
src.register_blueprint(auth_blueprint)
src.register_blueprint(user_blueprint)
src.register_blueprint(catalog_blueprint)
src.register_blueprint(bidding_blueprint)
src.register_blueprint(search_blueprint)

from . import routes
