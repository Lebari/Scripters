from flask import Flask
from flask_cors import CORS

# Blueprints


def create_app():
    # Configure Flask
    print("creating flask app")
    app = Flask(__name__)
    CORS(app)
    app.config["CORS_HEADERS"] = "Content-Type"


    from .src import src as main_blueprint
    from .tests import tests as tests_blueprint

    # register blueprints
    app.register_blueprint(main_blueprint)
    app.register_blueprint(tests_blueprint)

    return app
