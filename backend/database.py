from env import *
from flask_pymongo import PyMongo

def create_database(app):
    app.config['MONG_DBNAME'] = 'database'
    app.config['MONGO_URI'] = DB_URI 
    mongo = PyMongo(app)