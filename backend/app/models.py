# Schema for mapping Mongo Document structures to Python classes
from mongoengine import Document, StringField, IntField, ListField, \
    ReferenceField, DateTimeField, BooleanField


class Item(Document):
    name = StringField(required=True)
    price = IntField(required=True)
    status = BooleanField(required=True)
    category = StringField(required=True)


class User(Document):
    meta={'allow_inheritance': True}
    fname = StringField(required=True)
    lname = StringField(required=True)
    username = StringField(required=True)
    password = StringField(required=True)

class Event(Document):
    meta={'allow_inheritance': True}
    user = ReferenceField(User, required=True)
    type = StringField(required=True)
    time = DateTimeField(required=True)
    price = IntField(required=True)
    auction = ReferenceField('Auction', required=True)


class Bid(Event):
    pass


class Sale(Event):
    card = ReferenceField('Card', required=True)

class Broker(Document):
    subscriptions = ListField(StringField())


class Seller(User):
    sales = ListField(ReferenceField(Sale)) 
    auctions = ListField(ReferenceField('Auction')) 


class Auction(Document):
    item = ReferenceField(Item, required=True)
    slug = StringField(required=True)
    type = StringField(required=True)
    duration = IntField(required=True)
    seller = ReferenceField(Seller, required=True)

    date_added = DateTimeField()
    date_updated = DateTimeField()

    #TODO 2 fix below by creating needed classes
    event = ReferenceField(Event)
    broker = ReferenceField(Broker)
    bids = ListField(ReferenceField(Bid))

    def json_formatted(self):
        print(f"serializing {self.str}")
        model_json = self.to_mongo().to_dict()
        model_json["id"] = str(model_json["_id"])
        del model_json["_id"]
        return model_json 

class Card(Document):
    name = StringField(required=True)
    number = IntField(required=True, unique=True)
    cvv = IntField(required=True)
    expiry = DateTimeField(required=True)





