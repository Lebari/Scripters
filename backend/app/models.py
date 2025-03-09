# Schema for mapping Mongo Document structures to Python classes
from enum import StrEnum

from mongoengine import Document, StringField, IntField, ListField, \
    ReferenceField, DateTimeField, BooleanField
from flask_login import UserMixin, AnonymousUserMixin
from werkzeug.security import check_password_hash


class AuctionType(StrEnum):
    DUTCH = "Dutch",
    FORWARD = "Forward"


class EventType(StrEnum):
    SALE = "Sale",
    BID = "Bid"


class Category(StrEnum):
    # used to define categories for auction items. Might be redundant when frontend done.
    NEW = "New",
    SHOES = "Shoes",
    APPAREL = "Apparel",
    ACCESSORIES = "Accessories"


class Item(Document):
    name = StringField(required=True)
    price = IntField(required=True)
    status = BooleanField(required=True)
    category = StringField(required=True)

    def __str__(self):
        return self.name

    def get_id(self):
        return str(self.id)

    def get_desc(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "price": self.price,
            "status": self.status,
            "category": self.category
        }

    def to_json(self):
        print(f"serializing {self.__str__}")
        self.get_desc()


class User(UserMixin, Document):
    fname = StringField(required=True)
    lname = StringField(required=True)
    username = StringField(required=True, unique=True)
    password = StringField(required=True)
    is_seller = BooleanField(required=True)
    streetno = IntField(required=True)
    street = StringField(required=True)
    city = StringField(required=True)
    country = StringField(required=True)
    postal = StringField(required=True)
    broker = ReferenceField('Broker')
    cards = ListField(ReferenceField('Card'))
    sales = ListField(ReferenceField('Sale'))
    purchases = ListField(ReferenceField('Sale'))
    subscriptions = ListField(ReferenceField('Broker'))
    auctions = ListField(ReferenceField('Auction'))

    def check_password(self, password_hash, password):
        return check_password_hash(password_hash, password)

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def __str__(self):
        return self.username

    def get_desc(self):
        return {
            "id": str(self.id),
            "fname": self.fname,
            "lname": self.lname,
            "username": self.username,
        }

    def to_json(self):
        print(f"serializing {self.__str__}")
        model_json = self.to_mongo().to_dict()

        model_json["broker"] = self.broker.get_id() if self.broker else None
        model_json["cards"] = [card.get_id() for card in self.cards if card]
        model_json["sales"] = [sale.get_id() for sale in self.sales if sale]
        model_json["purchases"] = [purchase.get_id() for purchase in self.purchases if purchase]
        model_json["subscriptions"] = [sub.get_id() for sub in self.subscriptions if sub]
        model_json["auctions"] = [auction.get_id() for auction in self.auctions if auction]
        model_json["id"] = str(model_json["_id"])
        del model_json["_id"]
        return model_json


class Anonymous(AnonymousUserMixin):
    def __init__(self):
        self.username = 'Guest'


class Event(Document):
    meta={'allow_inheritance': True}
    user = ReferenceField(User, required=True)
    event_type = StringField(required=True)
    time = DateTimeField(required=True)
    price = IntField(required=True)
    auction = ReferenceField('Auction', required=True)

    def __str__(self):
        # return "{} {:'%B %d, %Y'}".format(self.event_type, self.time)
        return f"{self.event_type} {self.time:'%B %d, %Y'}"

    def get_id(self):
        return str(self.id)

    def to_json(self):
        print(f"serializing {self.__str__}")
        model_json = self.to_mongo().to_dict()

        model_json["user"] = str(self.user.id)
        model_json["auction"] = self.auction.get_id()
        model_json["id"] = str(model_json["_id"])
        del model_json["_id"]
        return model_json


class Bid(Event):
    def get_id(self):
        return str(self.id)

    def to_json(self):
        print(f"serializing {self.__str__}")
        return super.to_json()


class Sale(Event):
    card = ReferenceField('Card', required=True)

    def __str__(self):
        return self.auction.item.name + self.price

    def get_id(self):
        return str(self.id)

    def to_json(self):
        print(f"serializing {self.__str__}")
        model_json = super.to_json()
        model_json["card"] = self.card.get_id() if self.card else None
        return model_json


class Broker(Document):
    subscriptions = ListField(StringField()) #TODO need to figure out how to model a map here

    def get_id(self):
        return str(self.id)

    def to_json(self):
        model_json = self.to_mongo().to_dict()
        model_json["id"] = str(model_json["_id"])
        del model_json["_id"]
        return model_json


class Auction(Document):
    item = ReferenceField(Item, required=True)
    slug = StringField(required=True, unique=True)
    auction_type = StringField(required=True)
    duration = IntField(required=True)
    seller = ReferenceField(User, required=True)
    is_active = BooleanField(required=True)

    date_added = DateTimeField()
    date_updated = DateTimeField()

    event = ReferenceField(Event)
    broker = ReferenceField(Broker)
    bids = ListField(ReferenceField(Bid))

    def __str__(self):
        return self.item.name

    def get_id(self):
        return str(self.id)

    def to_json(self):

        print(f"serializing {self.__str__}")
        model_json = self.to_mongo().to_dict()
        # explicitly serializing reference fields
        model_json["item"] = self.item.get_desc()
        model_json["seller"] = self.seller.get_desc()
        model_json["event"] = self.event.get_id() if self.event else None
        model_json["broker"] = self.broker.get_id() if self.broker else None
        model_json["bids"] = [bid.get_id() for bid in self.bids if bid]

        model_json["id"] = str(model_json["_id"])
        del model_json["_id"]
        return model_json


class Card(Document):
    name = StringField(required=True)
    number = IntField(required=True, unique=True)
    cvv = IntField(required=True)
    expiry = DateTimeField(required=True)

 auction_upload_update
    def __str__(self):
        return self.name

    def get_id(self):
        return str(self.id)

    def to_json(self):
        print(f"serializing {self.__str__}")
        model_json = self.to_mongo().to_dict()
        model_json["id"] = str(model_json["_id"])
        del model_json["_id"]
        return model_json
    
class Payment(Document):
    user = ReferenceField(User, required=True)
    auction = ReferenceField(Auction, required=True)
    amount = IntField(required=True)
    status = StringField(required=True, choices=["Pending", "Success", "Failed"])
    payment_id = StringField(required=True, unique=True)
    timestamp = DateTimeField(required=True)

    def to_json(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user.id) if self.user else None,
            "auction_id": str(self.auction.id) if self.auction else None,
            "amount": self.amount,
            "status": self.status,
            "payment_id": self.payment_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }    
 Payment





