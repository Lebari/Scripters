from flask import Flask
from flask_cors import CORS
from backend.database import *
from flask_login import LoginManager
from backend.app.models import User, Anonymous


def create_app():
    # Configure Flask
    print("creating flask app")
    app = Flask(__name__)

    app.secret_key = SECRET_KEY

    # Configure Flask login manager
    login_manager = LoginManager()
    login_manager.anonymous_user = Anonymous
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        print("lod user")
        return User.objects(id=user_id).first()

    CORS(app)
    app.config["CORS_HEADERS"] = "Content-Type"

    from .src import src as main_blueprint
    from .tests import tests as tests_blueprint

    # register blueprints
    app.register_blueprint(main_blueprint)
    app.register_blueprint(tests_blueprint)

    init_db()
    return app
