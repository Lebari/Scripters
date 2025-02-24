# to run the app

from app import create_app
import database

app = create_app()
db = database.create_database(app)

if __name__ == "__main__":
    app.run(debug=True)
