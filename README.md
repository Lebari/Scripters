# Scripters Auction
Welcome to our Auction Project for EECS4413 W25.

View the project on GitHub at [https://github.com/Lebari/Scripters](https://github.com/Lebari/Scripters)

## Team Members
- Greatlove Bariboloka
- Shaylin Ziaei
- Abed Matinpour
- Muhammad Sawal

## Features

### Auction Expiration Mechanism
The system uses a timer-based auction expiration mechanism that is more efficient than periodic polling:

- When a new auction is created, a timer is automatically scheduled based on the auction's duration
- Each auction has its own dedicated timer that triggers exactly when the auction should expire
- When an auction expires, the system automatically marks it as inactive and sends appropriate notifications
- This approach is more responsive and reduces server load compared to periodic checking

The expiration process:
1. When an auction is created, a timer is scheduled using APScheduler
2. When the timer fires, the auction is marked as expired
3. If there's a winning bid, an `auction_won` notification is sent
4. If there's no winner, an `auction_expired` notification is sent
5. Notifications are delivered to the frontend via WebSockets

#### Troubleshooting Expiration & Notifications

If you're not seeing notifications when auctions expire, you can use the included test script to verify the system is working:

```bash
# Create a test auction that expires in 1 minute
python backend/test_expiration.py create test_auction 1

# Check the status of the auction
python backend/test_expiration.py check test_auction

# List all active auctions
python backend/test_expiration.py list

# Manually send a test notification through Redis
python backend/test_expiration.py test-notification
```

Also check the server logs for messages with these prefixes:
- `[SCHEDULING]` - Shows when auction expiration timers are set
- `[EXPIRATION]` - Shows when auctions are marked as expired
- `[REDIS]` - Shows when Redis events are published and processed
- `[SOCKETIO]` - Shows client connection events

If you see the notification events in the logs but not in the UI, check your browser console for any errors with the SocketIO connection.

## To get started
Complete both backend and frontend setup

### Backend
Clone the project and open a terminal or CLI session in the backend directory.

Install

- [python3.13.2](https://www.python.org/downloads/release/python-3132/)
- [venv](https://realpython.com/python-virtual-environments-a-primer/)

Create and activate a python virtual environment named "venv", and install packages based on `requirements.txt`

```
python3.12 -m venv "venv"
source venv/bin/activate
pip install -r requirements.txt
```

### Install [redis](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/install-redis-on-mac-os/) server.
Linux (Debian):
```
sudo apt-get update
sudo apt-get install redis-server
```

macOS:
```
brew install redis
```

### Start Redis Server:
linux (Debian):
```
sudo service redis-server start
```

macOS:
```
redis-server
```

### Frontend
Go to project root directory and install [bun](https://bun.sh/docs/installation)

Go into frontend directory and Use bun to install dependencies

```
cd Scripters/frontend
bun install
```

## Running Instructions

### Standard Setup
Open three CLI Sessions - one for backend, one for frontend and one for the redis server.

Ensure the redis server is running.

Go to backend directory and run:

`flask run`

Go to frontend directory and run:

`bun run dev`

### Docker Setup
The application can also be run using Docker containers, which simplifies setup and ensures consistency across different environments.

#### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

#### Running with Docker
1. Clone the repository and navigate to the project root directory
2. Start all containers:
   ```
   docker compose up -d
   ```
3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001

#### Docker Commands
- Start containers: `docker compose up -d`
- Stop containers: `docker compose down`
- View logs: `docker compose logs`
- View specific service logs: `docker compose logs [service]` (e.g., `docker compose logs frontend`)
- Rebuild containers: `docker compose up -d --build`

#### Container Architecture
The Docker setup consists of three containers:
1. **Frontend** (scripters-frontend): React application served by Vite
2. **Backend** (scripters-backend): Flask API server
3. **Redis** (scripters-redis): For real-time messaging and event handling

### Ports
- Frontend runs on port 5173
- Backend runs on port 5001 (when using Docker)
- When running locally, use run command `flask run - localhost -port 5001`
- Redis runs on port 6379


### To contribute:
Add functions to the routes.py file of the relevant directory, following the format in the existing hello_world() functions.

Branch off of `main`, with the name of your branch being the use case.

Submit a pull request to contribute your branch changes back into main, await approval from Abed before merging.

Ensure the requirements.txt is updated before pushing:

```
pip freeze > requirements.txt
```

## Stack
### Backend
- Python
- Flask 
- MongoDB

### Frontend
- React
- Typescript
- TailwindCSS
- Vite
- Bun
