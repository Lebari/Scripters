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

Create a python virtual environment named "venv", and install packages based on `requirements.txt`

```
python3.12 -m venv "venv"
source venv/bin/activate
pip install -r requirements.txt
```

Then run the flask server.
```
flask run
```

Visit the /sale, /catalog, and /auth routes by appending them to the server url. For instance,

`http://127.0.0.1:5000/sale`

### Frontend
Go to project root directory and install [bun](https://bun.sh/docs/installation)

Go into frontend directory and Use bun to install dependencies

```
cd Scripters/frontend
bun install
```

Run the application

`bun run dev`

## Running Instructions
Open two CLI Sessions - one for backend and one for frontend.

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
