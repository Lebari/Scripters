# Scripters Auction
Welcome to our Auction Project for EECS4413 W25.

## Team Members
- Greatlove Bariboloka
- Shaylin Ziaei
- Abed Matinpour
- Muhammad Sawal

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
Open three CLI Sessions - one for backend, one for frontend and one for the redis server.

Ensure the redis server is running.

Go to backend directory and run:

`flask run`

Go to frontend directory and run:

`bun run dev`


### Ports
- Frontend runs on port 5173
- Backend runs on port 5000


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
