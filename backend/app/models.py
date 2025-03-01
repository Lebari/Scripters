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
    street = StringField(required=True)
    streetno = IntField(required=True)
    city = StringField(required=True)
    country = StringField(required=True)
    postal = StringField(required=True)
    is_seller = BooleanField(required=True)

class Event(Document):
    meta={'allow_inheritance': True}
    user = ReferenceField(User, required=True)
    event_type = StringField(required=True)
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
    broker = ReferenceField('Broker', required=True)
    cards = ListField(ReferenceField('Card'))


class Auction(Document):
    item = ReferenceField(Item, required=True)
    slug = StringField(required=True)
    auction_type = StringField(required=True)
    duration = IntField(required=True)
    seller = ReferenceField(Seller, required=True)

    date_added = DateTimeField()
    date_updated = DateTimeField()

    #TODO 2 fix below by creating needed classes
    event = ReferenceField(Event)
    broker = ReferenceField(Broker)
    bids = ListField(ReferenceField(Bid))

    def to_json(self):

        return {
            "id": str(self.id),
            "item_id": str(self.item.id) if self.item else None,
            "slug": self.slug,
            "auction_type": self.auction_type,
            "duration": self.duration,
            "seller_id": str(self.seller.id) if self.seller else None,
            "date_added": self.date_added.isoformat() if self.date_added else None,
            "date_updated": self.date_updated.isoformat() if self.date_updated else None,
            "event_id": str(self.event.id) if self.event else None,
            "broker_id": str(self.broker.id) if self.broker else None,
            "bids": [str(bid.id) for bid in self.bids] if self.bids else []
        }
class Card(Document):
    name = StringField(required=True)
    number = IntField(required=True, unique=True)
    cvv = IntField(required=True)
    expiry = DateTimeField(required=True)





