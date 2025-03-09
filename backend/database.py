from mongoengine import connect
from .env import *


# with mongoengine, the connection is a global singleton that is managed by the library,
# we don't need to manage or return a variable
def init_db():
    print("Connecting to database")
    try:
        connect(db="database", host=DB_URI)
        print("Connected to mongo!")
    except Exception as e:
        print(f"failed to connect to mongo: {e}")


if __name__ == "__main__":
    init_db()
