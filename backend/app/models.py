# Schema for mapping Mongo Document structures to Python classes
from mongoengine import Document, StringField, IntField, ListField, \
    ReferenceField, DateTimeField, BooleanField


class Item(Document):
    name = StringField(required=True)
    price = IntField(required=True)
    status = BooleanField(required=True)
    category = StringField(required=True)


class User(Document):
    fname = StringField(required=True)
    lname = StringField(required=True)
    username = StringField(required=True)
    password = StringField(required=True)


class Seller(User):
    sales = ListField(Sale) #TODO 1 create Sale class
    auctions = ListField(Auction) #TODO ensure this works


class Auction(Document):
    item = Item(required=True)
    slug = StringField(required=True)
    type = StringField(required=True)
    duration = IntField(required=True)
    seller = ReferenceField(Seller, required=True)

    date_added: DateTimeField()
    date_updated: DateTimeField()

    #TODO 2 fix below by creating needed classes
    event = Event()
    broker = Broker()
    bids = ListField(Bid)

    def json_formatted(self):
        print(f"serializing {self.__str__}")
        model_json = self.to_mongo().to_dict()
        model_json["id"] = str(model_json["_id"])
        del model_json["_id"]
        return model_json
