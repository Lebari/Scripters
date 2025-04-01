Last updated March 10th by Greatlove

# Testing - curl

Wherever a token is specified, sign in first then get the token from the returned object. Tokens look like the below:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MTU4MDI0NywianRpIjoiYjM0YTBlZmYtYjZkZS00NGYxLTk0MDktYWJkZDg4M2Q2ZmU2IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImhpeWEiLCJuYmYiOjE3NDE1ODAyNDcsImNzcmYiOiI0NzFiNjM2My02MjAyLTRiOGMtOGMyMi05ZjhlNjc4MGY3MmQiLCJleHAiOjE3NDE1ODc0NDd9.9UdgDEC_SKjBPpxOjH6veqNe3cwwxmX3DXZ4dM7z8gg
```


## Catalog - Get all auctions
```
curl --location 'http://127.0.0.1:5000/catalog'
```

## Catalog - Get some auction
```
curl --location 'http://127.0.0.1:5000/catalog/auction5'
```

## Catalog - upload auction
```
curl --location 'http://127.0.0.1:5000/catalog/upload' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MTU4MDI0NywianRpIjoiYjM0YTBlZmYtYjZkZS00NGYxLTk0MDktYWJkZDg4M2Q2ZmU2IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImhpeWEiLCJuYmYiOjE3NDE1ODAyNDcsImNzcmYiOiI0NzFiNjM2My02MjAyLTRiOGMtOGMyMi05ZjhlNjc4MGY3MmQiLCJleHAiOjE3NDE1ODc0NDd9.9UdgDEC_SKjBPpxOjH6veqNe3cwwxmX3DXZ4dM7z8gg'
--data '{
    "name": "Item Five",
    "price": 10,
    "status": true,
    "category": "New",
    "slug": "auction5",
    "auction_type": "Dutch",
    "duration": 40
}'
```

## Catalog - update dutch auction
```
curl --location --request PATCH 'http://127.0.0.1:5000/catalog/auction5/dutch-update' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MTU4MDI0NywianRpIjoiYjM0YTBlZmYtYjZkZS00NGYxLTk0MDktYWJkZDg4M2Q2ZmU2IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImhpeWEiLCJuYmYiOjE3NDE1ODAyNDcsImNzcmYiOiI0NzFiNjM2My02MjAyLTRiOGMtOGMyMi05ZjhlNjc4MGY3MmQiLCJleHAiOjE3NDE1ODc0NDd9.9UdgDEC_SKjBPpxOjH6veqNe3cwwxmX3DXZ4dM7z8gg'
--data '{
    "price": 20
}'
```

## Signup
```
curl --location 'http://127.0.0.1:5000/signup' \
--header 'Content-Type: application/json' \
--data '{
    "fname": "Hi",
    "lname": "Wu",
    "username": "hiya",
    "password": "hiya",
    "streetno": "1",
    "street": "Clutch st",
    "city": "Barrie",
    "country": "Canada",
    "postal": "B1D 9C2"
}'
```

## Login
```
curl --location --request GET 'http://127.0.0.1:5000/login' \
--header 'Content-Type: application/json' \
--data '{
    "username": "hiya",
    "password": "hiya"
}'
```

## Logout
```
curl --location 'http://127.0.0.1:5000/logout'
```

## Get User object for signed in user
```
curl --location 'http://127.0.0.1:5000/user' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MTU4MDI0NywianRpIjoiYjM0YTBlZmYtYjZkZS00NGYxLTk0MDktYWJkZDg4M2Q2ZmU2IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImhpeWEiLCJuYmYiOjE3NDE1ODAyNDcsImNzcmYiOiI0NzFiNjM2My02MjAyLTRiOGMtOGMyMi05ZjhlNjc4MGY3MmQiLCJleHAiOjE3NDE1ODc0NDd9.9UdgDEC_SKjBPpxOjH6veqNe3cwwxmX3DXZ4dM7z8gg'
```

## Become Seller
```
curl --location --request PATCH 'http://127.0.0.1:5000/become_seller' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MTU4MDI0NywianRpIjoiYjM0YTBlZmYtYjZkZS00NGYxLTk0MDktYWJkZDg4M2Q2ZmU2IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImhpeWEiLCJuYmYiOjE3NDE1ODAyNDcsImNzcmYiOiI0NzFiNjM2My02MjAyLTRiOGMtOGMyMi05ZjhlNjc4MGY3MmQiLCJleHAiOjE3NDE1ODc0NDd9.9UdgDEC_SKjBPpxOjH6veqNe3cwwxmX3DXZ4dM7z8gg'

```

## Remove Seller
```
curl --location --request PATCH 'http://127.0.0.1:5000/remove_seller' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MTU4MDI0NywianRpIjoiYjM0YTBlZmYtYjZkZS00NGYxLTk0MDktYWJkZDg4M2Q2ZmU2IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImhpeWEiLCJuYmYiOjE3NDE1ODAyNDcsImNzcmYiOiI0NzFiNjM2My02MjAyLTRiOGMtOGMyMi05ZjhlNjc4MGY3MmQiLCJleHAiOjE3NDE1ODc0NDd9.9UdgDEC_SKjBPpxOjH6veqNe3cwwxmX3DXZ4dM7z8gg'
```


## Generate Receipt
```
curl --location --request POST 'http://127.0.0.1:5000/receipt' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MTgzOTQ0MSwianRpIjoiMzc4NTI3OWItN2M0NS00NmRlLWE4YjAtMDRiYzg5ZTQ4YjVkIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFiZDFAZ21haWwuY29tIiwibmJmIjoxNzQxODM5NDQxLCJjc3JmIjoiMTFlNzg5MDctOTRlZC00MDZjLWJmOWEtZWViOGE2ODgxZDk2IiwiZXhwIjoxNzQxODQ2NjQxfQ.y4EfkvOCWdOwd5S2NJSYNq9Urfu1hwG4ssdJZnSaFgA' \
--data-raw '{
    "purchase_id": "67d25ceea6cd19856a6783b0"
}'
```

## Generate Payment
```
curl --location --request POST 'http://127.0.0.1:5000/payment' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MTgzOTQ0MSwianRpIjoiMzc4NTI3OWItN2M0NS00NmRlLWE4YjAtMDRiYzg5ZTQ4YjVkIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImFiZDFAZ21haWwuY29tIiwibmJmIjoxNzQxODM5NDQxLCJjc3JmIjoiMTFlNzg5MDctOTRlZC00MDZjLWJmOWEtZWViOGE2ODgxZDk2IiwiZXhwIjoxNzQxODQ2NjQxfQ.y4EfkvOCWdOwd5S2NJSYNq9Urfu1hwG4ssdJZnSaFgA' \
--data-raw '{
    "auction_id": "67cba9d6000720ea7a0c9977",
    "card_number": "4111111111111111",
    "card_name": "Jane Doe",
    "exp_date": "12/27",
    "security_code": "123"
}'

```
