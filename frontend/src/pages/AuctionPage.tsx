import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Auction as AuctionType } from '../models.ts';
import Button from '../components/Button.tsx';
import axios from "axios";

const AuctionPage: React.FC = () => {
    const location = useLocation();
    const { name } = useParams<{ name: string }>();
    const [auction, setAuction] = useState<AuctionType | null>(location.state as AuctionType);
    const [popupVisible, setPopupVisible] = useState(false); // Controls visibility

    const [priceInput, setPriceInput] = useState( 0);

    const handleBid = () => {
        if (!auction) {
            console.error("Auction is not loaded yet.");
            return;
        }
        if(name){
        try {
            // TODO allow for forward bid
            axios({
                baseURL: "http://localhost:5000",
                url: `${encodeURIComponent(name)}/dutch-update`,
                method: "patch",
            }).then(async (result) => {
                console.log(result.data);
                setPopupVisible(true); // Show the popup
                setTimeout(() => setPopupVisible(false), 800); // fade popup out
            }).catch(async (error) => {
                if (error.response) {
                    console.log(error.response);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
            });
        } catch (error) {
            console.error("Failed to bid:", error);
        }
        }
    };

    const handleDutchUpdate = () => {
        if (!auction) {
            console.error("Auction is not loaded yet.");
            return;
        }

        if(name){
        try {
            axios({
                baseURL: "http://localhost:5000",
                url: `catalog/${encodeURIComponent(name)}/dutch-update`,
                method: "patch",
                data:{
                    price: priceInput
                }
            }).then(async (result) => {
                console.log(result.data);
                setPopupVisible(true); // Show the popup
                setTimeout(() => setPopupVisible(false), 800); // fade popup out
                getAuctionCall(name);
            }).catch(async (error) => {
                if (error.response) {
                    console.log(error.response);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
            });
        } catch (error) {
            console.error("Failed to bid:", error);
        }
        }
    };
    const getAuction = () => {
        if (location.state) {
            setAuction(location.state as AuctionType);
        } else if (name) {
            getAuctionCall(name);
        }
    };

    const getAuctionCall = (name: string)=>{
        axios({
            baseURL: "http://localhost:5000",
            url: `catalog/${encodeURIComponent(name)}`,
            method: "get",
        }).then(async (result) => {
            console.log(result.data);
            setAuction(result.data.auction);
        }).catch(async (error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        });
    }

    useEffect(() => {
        getAuction(); // Reset auction and get new data when route changes
    }, [name, location.state]);

    const updateForm = (event: React.ChangeEvent<HTMLInputElement>) => {
        // handle updating the loginForm state whenever a field changes
        const {value} = event.target
        setPriceInput(Number.parseInt(value));
        console.log(priceInput);
    }

    if (!auction) return <div>Loading...</div>;

    return (
        <div>
            <div
                className="flex flex-col px-10 mx-5 pl-8 border-r border-r-camel pr-[80px] overflow-y-auto scrollbar-hidden">
                {/* Auction */}
                <div>
                    <h1 className="text-xl">{auction.item.name}</h1>
                    <p className="pt-4">$ {auction.item.price.toFixed(2)}</p>
                    <p className="pt-4 text-sm">Category: {auction.item.category}</p>

                    <p className="pt-4">Go to /{auction.slug}</p>
                    <p className="pt-4 text-sm">Type: {auction.auction_type} Auction</p>
                    <p className="pt-4">Seller: {auction.seller.username}</p>

                    <p className="pt-4 text-sm">Duration: {auction.duration} hours</p>
                    <p className="pt-4">Added: {auction.date_added}</p>
                    <p className="pt-4 text-sm">Last Updated: {auction.date_updated}</p>

                    <div className="relative">
                        {auction.auction_type === "Dutch"?
                        //     Show button to update price
                        <div>
                        <input type={"number"} name={"price"} value={priceInput} onChange={updateForm}></input>
                        <Button onClick={handleDutchUpdate}
                                // disabled={priceInput >= 0}
                        >
                            Update Price
                        </Button>
                        </div>
                        :
                        //     show button to Bid
                        <div>
                        <input type={"number"} name={"price"} value={priceInput} onChange={updateForm}></input>
                        <Button onClick={handleBid}
                            // disabled={priceInput >= 0}
                        >
                            Bid
                        </Button>
                        </div>
                        }
                        {/* Popup Notification */}
                        <div
                            className={`absolute -top-3 -left-7 text-green px-3 py-1 transition-opacity duration-500 ${
                                popupVisible ? 'opacity-100 text-red' : 'opacity-0 pointer-events-none'
                            }`}
                        >
                            {auction.item.price === 0 ? '' : 'Success!'}
                        </div>
                    </div>
                </div>

                {/* Shipping info */}
                <div className="mt-8 border-t border-t-camel">
                    <p className="text-xl pt-8">Shipping and Refunds</p>
                    <br/>
                    <p className="text-sm">Ships within 2-3 business days from warehouses in Nigeria</p>
                    <br/>
                    <p className="text-sm">Refund Policy</p>
                    <ul className="text-sm list-disc ml-10">
                        <li className="pt-2">Refunds allowed within 30 days of receipt. Must be unopened.</li>
                        <li>No exchanges</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AuctionPage;
