Last updated March 13th

# Testing - curl

## NOTE: Wherever a token is specified, sign in first then get the token from the returned object. Tokens look like the below:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MTczNjgxMCwianRpIjoiNTIzM2U4OGQtZGE3Ni00OTM0LWIwNzItODk3ZTc5ZDY2NDgwIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImhpeWEiLCJuYmYiOjE3NDE3MzY4MTAsImNzcmYiOiI1MDM5NzBlMy03MWQwLTQxMTYtYTI2My02MTJkZGJhNDE0NDEiLCJleHAiOjE3NDE3NDQwMTB9.h-_gKvwS-PD1lMfmY9uua_EQeohmo8rpA9UUtLm5L54
```


## Get all auctions
```
curl --location 'http://127.0.0.1:5000/catalog'
```

## Get some auction using the auction's slug
```
curl --location 'http://127.0.0.1:5000/catalog/<slug>'
eg. curl --location 'http://127.0.0.1:5000/catalog/auction5'
```

## Get the signed-in user's auctions
ie. The auctions that the user is the seller of
```
curl --location 'http://127.0.0.1:5000/myauctions' \
--header 'Authorization: Bearer <token>'
```

## Search Retrieve all
```
curl --location --request POST 'http://127.0.0.1:5000/search/' \
--header 'Content-Type: application/json'
```

## Search item by keyword
```
curl --location --request POST 'http://127.0.0.1:5000/search/' \
--header 'Content-Type: application/json' \
--data '{
    "keyword": "One"
}'
```
Robustness test:
- No keyword specified in payload

## Upload auction
Note: Duration is in minutes and our pub-sub system ensures that auctions become inactive when the duration is over from the time they were added. 
```
curl --location --request POST 'http://127.0.0.1:5000/catalog/upload' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <token>' \
--data '{
    "name": "My User Item",
    "price": 10,
    "status": true,
    "category": "New",
    "slug": "myItem",
    "auction_type": "Dutch",
    "duration": 4000
}'
```
Robustness test:
- Slug must be unique
- Price and duration must be non-negative integers
- Type must be Dutch or Forward

## Update dutch auction
Specify auction slug in the url
```
curl --location --request PATCH 'http://127.0.0.1:5000/catalog/<slug>/dutch-update' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <token>'
--data '{
    "price": 20
}'
```
Robustness test:
- Auction must be active

## Signup
A user must sign in after signup to generate a token.
```
curl --location --request POST 'http://127.0.0.1:5000/signup' \
--header 'Content-Type: application/json' \
--data '{
    "fname": "My",
    "lname": "User",
    "username": "myUser@gmail.com",
    "password": "myUser",
    "streetno": "1",
    "street": "Juice st",
    "city": "Narrie",
    "country": "Canada",
    "postal": "B1D 9C2"
}'
```

Robustness tests:
- Username must be unique
- All fields must be non-empty strings

## Login
```
curl --location --request POST 'http://127.0.0.1:5000/login' \
--header 'Content-Type: application/json' \
--data '{
    "username": "myUser@gmail.com",
    "password": "myUser"
}'
```
Robustness tests:
- User with username must exist
- Username and password must match existing user

## Logout
```
curl --location --request POST 'http://127.0.0.1:5000/logout' \
--header 'Authorization: Bearer <token>'
```
Robustness test:
- A user must be signed in

## Get User object for signed in user
```
curl --location 'http://127.0.0.1:5000/user' \
--header 'Authorization: Bearer <token>'
```
Robustness test:
- A user must be signed in

## Make signed-in user a seller
This is implicitly done when the user makes their first upload. However, a user's is_seller field may be directly set in the case of inactivity.
```
curl --location --request PATCH 'http://127.0.0.1:5000/become_seller' \
--header 'Authorization: Bearer <token>'
```
Robustness test:
- A user must be signed in

## Remove Seller Access
This is implicitly done when the user makes their first upload. However, a user's is_seller field may be directly unset in the case of inactivity.
```
curl --location --request PATCH 'http://127.0.0.1:5000/remove_seller' \
--header 'Authorization: Bearer <token>'
```
Robustness test:
- A user must be signed in

## Bidding Dutch - Buy now 
```
curl --location --request POST 'http://127.0.0.1:5000/bid/dutch/auction5' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <token>'
```
Robustness test:
- Auction must be active (duration not over and still up for sale)
- Auction type must be Dutch
- Auction slug must be valid

## Bidding Forward - Bid
```
curl --location --request POST 'http://127.0.0.1:5000/bid/forward/auction5' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <token>' \
--data-raw '{
    "price": 25
}'
``` 
Robustness test:
- Auction must be active (duration not over and still up for sale)
- New bid price must be >= current auction price
- Auction type must be Forward
- Auction slug must be valid

## Make Payment
```
curl --location 'http://127.0.0.1:5000/payment' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MTkxNjQ2MiwianRpIjoiZTk0Y2MyNWMtZTQ3Mi00NzlkLWI0ZTctMmU0OTk2YzFiZWNjIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImhpeWEiLCJuYmYiOjE3NDE5MTY0NjIsImNzcmYiOiIyMTJjZWYzZS1kMTdlLTQ3MGUtOTg1Ny05NjdlYzQ5MWRkMzEiLCJleHAiOjE3NDE5MjM2NjJ9.N7EeH5GIRUjdfi2HtkFycxqSb6_sl2ESrvLUHs1lwVs' \
--data '{
    "auction_slug": "auction5",
    "card_number": "12",
    "card_name": "Jane Doe",
    "exp_date": "12/27",
    "security_code": "123"
}'
```
Robustness test:
- Auction slug must exist
- User must be auction's winner

## Generate Receipt
Get a valid purchase id by first getting the User object from [/user](#get-user-object-for-signed-in-user).
Or by making a [payment](#make-payment).
```
curl --location --request POST 'http://127.0.0.1:5000/receipt' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <token>' \
--data-raw '{
    "purchase_id": "67d25ceea6cd19856a6783b0"
}'
```
Robustness test:
- Purchase ID must be one of user's
