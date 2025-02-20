from flask import Flask
from flask_cors import CORS
# Blueprints


def create_app():
    # Configure Flask
    print("creating flask app")
    app = Flask(__name__)
    CORS(app)
    app.config["CORS_HEADERS"] = "Content-Type"

    # connect(host="<CONNECTION_STRING>/flask_example_db") # connect mongoengine to mongodb atlas

    #set up mongodb with flask
    # app.config['MONGODB_SETTINGS'] = {
    #     'db': 'your_database',
    #     'host': 'localhost',
    #     'port': 27017
    # }
    # db = MongoEngine()
    # db.init_app(app)
    from .src import src as main_blueprint
    from .tests import tests as tests_blueprint

    # register blueprints
    app.register_blueprint(main_blueprint)
    app.register_blueprint(tests_blueprint)

    return app
