# to run the app

from app import create_app
from flask_socketio import SocketIO
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Create Flask app with SocketIO configuration
app = create_app()

# Note: The SocketIO instance is already created inside create_app()
# This is just a reference to access it for running the server
socketio = app.socketio

if __name__ == "__main__":
    logging.info("Starting server with SocketIO support")
    # Use the socketio.run method instead of app.run for proper WebSocket support
    socketio.run(
        app, 
        debug=True, 
        host='0.0.0.0',  # Allow external connections
        port=5000,
        allow_unsafe_werkzeug=True,  # Required for development server
        log_output=True,  # Enable SocketIO logging
        use_reloader=False  # Avoid duplicate SocketIO connections on reload
    )
