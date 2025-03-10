Last updated March 7th by Greatlove

# Testing - curl
## Catalog - Get all auctions
curl --location 'http://127.0.0.1:5000/catalog'

## Catalog - Get some auction
curl --location 'http://127.0.0.1:5000/catalog/auction5'

## Catalog - upload auction
curl --location 'http://127.0.0.1:5000/catalog/upload' \
--header 'Content-Type: application/json' \
--header 'Cookie: session=.eJwlzjtuRDEIQNG9uE7Bx2CYzYzAGCXtm0wVZe95Uqrb3OL8jGdf5_U5Ht_X-3yM51eNxzhMbmwq5eShLGCzwMBBVpohm4Nq9KF03T63Ht5r1wpzilLA2YXW93k3A4kixGcxtacl9MHdc02B3DApl3Ky4zGRBPFxQ96vc_1rdO3UdlakSIsoQYysHr9_pIw06A.Z8uj2A.UW7KFGrCBgAPR9JjMMtcut202h0' \
--data '{
    "name": "Item Five",
    "price": 10,
    "status": true,
    "category": "New",
    "slug": "auction5",
    "auction_type": "Dutch",
    "duration": 40
}'

## Catalog - update dutch auction
curl --location --request PATCH 'http://127.0.0.1:5000/catalog/auction5/dutch-update' \
--header 'Content-Type: application/json' \
--header 'Cookie: session=.eJwlzjtuRDEIQNG9uE7Bx2CYzYzAGCXtm0wVZe95Uqrb3OL8jGdf5_U5Ht_X-3yM51eNxzhMbmwq5eShLGCzwMBBVpohm4Nq9KF03T63Ht5r1wpzilLA2YXW93k3A4kixGcxtacl9MHdc02B3DApl3Ky4zGRBPFxQ96vc_1rdO3UdlakSIsoQYysHr9_pIw06A.Z8uj2A.UW7KFGrCBgAPR9JjMMtcut202h0' \
--data '{
    "price": 20
}'

## Signup
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

## Login
curl --location --request GET 'http://127.0.0.1:5000/login' \
--header 'Content-Type: application/json' \
--data '{
    "username": "hiya",
    "password": "hiya"
}'

## Logout
curl --location 'http://127.0.0.1:5000/logout'

## Become Seller
curl --location --request PATCH 'http://127.0.0.1:5000/become_seller' \
--header 'Cookie: session=.eJwlzjtuRDEIQNG9uE7Bx2CYzYzAGCXtm0wVZe95Uqrb3OL8jGdf5_U5Ht_X-3yM51eNxzhMbmwq5eShLGCzwMBBVpohm4Nq9KF03T63Ht5r1wpzilLA2YXW93k3A4kixGcxtacl9MHdc02B3DApl3Ky4zGRBPFxQ96vc_1rdO3UdlakSIsoQYysHr9_pIw06A.Z8twjQ.BsgXzVY8cqoKqk772Lks9tEBPDE'

## Remove Seller
curl --location --request PATCH 'http://127.0.0.1:5000/remove_seller' \
--header 'Cookie: session=.eJwlzjtuRDEIQNG9uE7Bx2CYzYzAGCXtm0wVZe95Uqrb3OL8jGdf5_U5Ht_X-3yM51eNxzhMbmwq5eShLGCzwMBBVpohm4Nq9KF03T63Ht5r1wpzilLA2YXW93k3A4kixGcxtacl9MHdc02B3DApl3Ky4zGRBPFxQ96vc_1rdO3UdlakSIsoQYysHr9_pIw06A.Z8twjQ.BsgXzVY8cqoKqk772Lks9tEBPDE'


## Generate Receipt
curl -X POST http://127.0.0.1:5000/receipt \
     -H "Content-Type: application/json" \
     -d '{
           "purchase_id": "67cf1a30c81816310373af8e"
         }'

## Generate Payment
curl -X POST http://127.0.0.1:5000/payment \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -d '{
           "auction_id": "67cba9d6000720ea7a0c9977",
           "card_number": "4111111111111111",
           "card_name": "John Doe",
           "exp_date": "12/26",
           "security_code": "123",
           "shipping_address": "123 Main Street, New York, NY 10001"
         }'
