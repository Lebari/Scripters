// Type definitions for frontend models
export const AuctionType = {
    DUTCH: "Dutch",
    FORWARD: "Forward"
}
export interface User{
    id: string,
    fname: string,
    lname: string,
    username: string
    password: string,

    is_seller: boolean,
    streetno: number,
    street: string,
    city: string,
    country: string,
    postal: string,

    broker: string,
    cards: string[],
    sales: string[],
    purchases: string[],
    subscriptions: string[],
    auctions: string[],
}

export interface Item{
    id: string,
    name: string,
    price: number,
    status: string,
    category: string,
}

export interface UserDesc{
    id: string,
    fname: string,
    lname: string,
    username: string
}
export interface Auction{
    id: string,
    item: Item,
    slug: string,
    auction_type: string,
    is_active: string,
    duration: number,
    seller: UserDesc,
    date_added: string,
    date_updated: string,
    bids: string[],
    broker: string,
    event: string,
}

export interface Broker{
    id: string,
    user: string,
    price: number,
    time: string,
    event_type: string,
    auction: string,
}

export interface Card{
    id: string,
    name: string,
    number: number,
    cvv: number,
    expiry: string
}

export interface Event{
    id: string,
    user: string,
    price: number,
    time: string,
    event_type: string,
    auction: string,
}
export interface Sale{
    id: string,
    card: Card,
    user: string,
    price: number,
    time: string,
    event_type: string,
    auction: string,
}
export interface Broker{
    id: string,
    subscriptions: string,
}
export interface Bid{
    id: string,
    user: string,
    price: number,
    time: string,
    event_type: string,
    auction: string,
}