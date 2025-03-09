from . import user
from ...models import User

from flask import jsonify
from flask_login import login_required, current_user


@user.route("/user", methods=["GET"])
@login_required
def get_user():
    print("Hello from get_user")
    try:
        user = User.objects(username=current_user.username).first()
        print(f"{user.username}")
        return jsonify({"user": user.to_json()}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
