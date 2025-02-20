# Schema for mapping Mongo Document structures to Python classes
from mongoengine import Document, StringField, IntField, ListField, ReferenceField


class Item(Document):
    name = StringField(required=True)
    price = IntField(required=True)
    status = StringField(required=True)
    category = StringField(required=True)


class User(Document):
    fname = StringField(required=True)
    lname = StringField(required=True)
    username = StringField(required=True)
    password = StringField(required=True)


class Seller(User):
    sales = ListField() #TODO change when Sale class is created
    auctions = ListField(Auction) #TODO ensure this works


class Auction(Document):
    name = StringField(required=True)
    duration = IntField(required=True)
    item = Item(required=True)
    type = StringField(required=True)
    seller = ReferenceField(Seller, required=True)

    #TODO fix below by creating needed classes
    event = Event()
    broker = Broker()
    bids = ListField(Bid)

    def json_formatted(self):
        print(f"serializing {self.__str__}")
        model_json = self.to_mongo().to_dict()
        model_json["id"] = str(model_json["_id"])
        del model_json["_id"]
        return model_json
