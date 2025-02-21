# Scripters Auction Backend

### To get started:
Clone the project and open a terminal session /CLI in the backend directory.

Install

- [python3.12](https://www.python.org/downloads/release/python-3120/)
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

### To contribute:
Add functions to the routes.py file of the relevant directory, following the format in the existing hello_world() functions.

Branch off of `main`, with the name of your branch being the use case.

Submit a pull request to contribute your branch changes back into main, await approval from Abed before merging.

Ensure the requirements.txt is updated before pushing:

```
pip freeze > requirements.txt
```

### Stack
- Python
- Flask 
- MongoDB