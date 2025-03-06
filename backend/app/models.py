# Schema for mapping Mongo Document structures to Python classes
from mongoengine import Document, StringField, IntField, ListField, \
    ReferenceField, DateTimeField, BooleanField


class Item(Document):
    name = StringField(required=True)
    price = IntField(required=True)
    status = BooleanField(required=True)
    category = StringField(required=True)

    def __str__(self):
        return self.name

    def get_id(self):
        return {"id": str(self.id)}

    def get_desc(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "price": self.price,
            "status": self.status,
            "category": self.category
        }

    def json_formatted(self):
        print(f"serializing {self.__str__}")
        self.get_desc()


class User(Document):
    fname = StringField(required=True)
    lname = StringField(required=True)
    username = StringField(required=True, unique=True)
    password = StringField(required=True)
    is_seller = BooleanField()
    streetno = IntField()
    street = StringField()
    city = StringField()
    country = StringField()
    postal = StringField()
    broker = ReferenceField('Broker')
    cards = ListField(ReferenceField('Card'))
    sales = ListField(ReferenceField('Sale'))
    purchases = ListField(ReferenceField('Sale'))
    subscriptions = ListField(ReferenceField('Broker'))
    auctions = ListField(ReferenceField('Auction'))

    def __str__(self):
        return self.username

    def get_id(self):
        return {"id": str(self.id)}

    def get_desc(self):
        return {
            "id": str(self.id),
            "fname": self.fname,
            "lname": self.lname,
            "username": self.username,
        }

    def json_formatted(self):
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
        return {"id": str(self.id)}

    def json_formatted(self):
        print(f"serializing {self.__str__}")
        model_json = self.to_mongo().to_dict()

        model_json["user"] = self.user.get_id()
        model_json["auction"] = self.auction.get_id()
        model_json["id"] = str(model_json["_id"])
        del model_json["_id"]
        return model_json


class Bid(Event):
    def get_id(self):
        return {"id": str(self.id)}

    def json_formatted(self):
        print(f"serializing {self.__str__}")
        return super.json_formatted()


class Sale(Event):
    card = ReferenceField('Card', required=True)

    def __str__(self):
        return self.auction.item.name + self.price

    def get_id(self):
        return {"id": str(self.id)}

    def json_formatted(self):
        print(f"serializing {self.__str__}")
        model_json = super.json_formatted()
        model_json["card"] = self.card.get_id() if self.card else None
        return model_json


class Broker(Document):
    subscriptions = ListField(StringField()) #TODO need to figure out how to model a map here

    def get_id(self):
        return {"id": str(self.id)}

    def json_formatted(self):
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
        return {"id": str(self.id)}

    def json_formatted(self):

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

    def __str__(self):
        return self.name

    def get_id(self):
        return {"id": str(self.id)}

    def json_formatted(self):
        print(f"serializing {self.__str__}")
        model_json = self.to_mongo().to_dict()
        model_json["id"] = str(model_json["_id"])
        del model_json["_id"]
        return model_json





