# to run the app

from app import create_app
from flask_socketio import SocketIO

app = create_app()

# Initialize SocketIO using the same Flask app instance
socketio = SocketIO(app)

if __name__ == "__main__":
    socketio.run(app, debug=True)
