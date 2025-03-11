from datetime import timedelta

from flask import Flask
from flask_cors import CORS
from backend.database import *
from backend.app.models import User, Anonymous
from flask_jwt_extended import JWTManager


def create_app():
    # Configure Flask
    print("creating flask app")
    app = Flask(__name__)

    app.secret_key = SECRET_KEY

    app.config["CORS_HEADERS"] = "Content-Type"
    CORS(app)

    # Configure JWT Manager for session mgt.
    app.config["JWT_SECRET_KEY"] = SECRET_KEY
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=2)
    jwt = JWTManager(app)

    @jwt.user_lookup_loader
    def user_lookup_loader(_jwt_header, jwt_data):
        # defines how current_user is determined
        username = jwt_data["sub"]
        return User.objects(username=username).first() or None

    from .src import src as main_blueprint
    from .tests import tests as tests_blueprint

    # register blueprints
    app.register_blueprint(main_blueprint)
    app.register_blueprint(tests_blueprint)

    init_db()
    return app
