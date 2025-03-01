from mongoengine import connect
from .env import *

def init_db():

    connect(
        db='database',
        host=DB_URI
    )