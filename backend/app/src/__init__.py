from flask import Blueprint

src = Blueprint("src", __name__)

# Blueprints
from .sale import sale as sale_blueprint
from .auth import auth as auth_blueprint
from .catalog import catalog as catalog_blueprint

# register blueprints
src.register_blueprint(sale_blueprint)
src.register_blueprint(auth_blueprint)
src.register_blueprint(catalog_blueprint)

from . import routes
