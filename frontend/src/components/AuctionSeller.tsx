import React, {useEffect, useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Auction as AuctionType } from "../models.ts";
import Button from "./Button.tsx";
import {useTokenContext} from "./TokenContext.tsx";
import axios from "axios";

interface CatalogItemProps {
    auction: AuctionType;
    btnLabel?: string;
}

const Auction: React.FC<CatalogItemProps> = ({ auction, btnLabel }) => {
    const navigate = useNavigate();
    const isNavigating = useRef(false);
    const { user } = useTokenContext();
    const [bids, setBids] = useState();

    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            if (auction) {
                const now = new Date();
                const addedDate = new Date(auction.date_added);
                // Add the duration in minutes to the past date
                addedDate.setMinutes(addedDate.getMinutes() + auction.duration);
                const difference = addedDate.getTime() - now.getTime();

                if (isNaN(addedDate.getTime())) {
                    console.log('Invalid date and time.');
                    return "";
                }

                if (difference <= 0) {
                    clearInterval(interval);
                    setTimeLeft({days: 0, hours: 0, minutes: 0, seconds: 0});
                } else {
                    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                    setTimeLeft({days, hours, minutes, seconds});
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [new Date()]);

    function getTimeLeft():string {
        const days = timeLeft.days;
        const hours = timeLeft.hours;
        const minutes = timeLeft.minutes;
        const seconds = timeLeft.seconds;

        let formattedDate = `${days} days, ${hours} hrs, ${minutes} mins, ${seconds} secs`;
        if (days == 0) {
            formattedDate = `${hours} hrs, ${minutes} mins, ${seconds} secs`;
            if (hours == 0) {
                formattedDate = `${minutes} mins, ${seconds} secs`;
                if (minutes == 0) formattedDate = `${seconds} secs`;
            }
        }
        return formattedDate;
    }
    const getAuctionBids = () =>{
        axios({
            baseURL: import.meta.env.VITE_API_URL,
            url: `/catalog/${encodeURIComponent(auction.slug)}/latest`,
            method: "get",
        }).then((result) => {
            console.log(result);
            setBids(result.data.bids);
        }).catch((error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        });
    }
    useEffect(()=>{getAuctionBids();}, []);

    const detailClick = () => {
        if (isNavigating.current) return;
        isNavigating.current = true;

        // don't let owners of auctions bid on their own auction
        if (user.username == auction.seller.username) {
            if (auction.auction_type == "Dutch") navigate(`${import.meta.env.VITE_APP_DCH_UPDATE_URL}/${encodeURIComponent(auction.slug)}`, { state: auction });
            else navigate(`${import.meta.env.VITE_APP_FWD_UPDATE_URL}/${encodeURIComponent(auction.slug)}`, { state: auction });
        }

        else navigate(`${import.meta.env.VITE_APP_CATALOG_URL}/${encodeURIComponent(auction.slug)}`, { state: auction });
    };


    return (
        <div 
            className="bg-black-800 rounded-lg overflow-hidden border border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-gold/50 hover:scale-[1.02]"
            onClick={detailClick}
        >
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg truncate text-gray-100">{auction.item.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        auction.auction_type === "Dutch" 
                            ? "bg-accent-red/10 text-red border border-red/20" 
                            : "bg-green/10 text-green-light border border-green/20"
                    }`}>
                        {auction.auction_type}
                    </span>
                </div>
                
                <div className="mb-4">
                    <p className="text-xl font-semibold text-gold mb-1">
                        ${auction.item.price.toFixed(2)}
                    </p>
                    
                    <div className="text-xs text-gray-400">
                        Category: {auction.item.category}
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-4 mb-4">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">Time Left:</span>
                        <span className="text-sm text-gray-300">{getTimeLeft()}</span>
                    </div>
                    
                    <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">Seller:</span>
                        <span className="text-sm text-gray-300">{auction.seller.username}</span>
                    </div>
                    
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Added:</span>
                        <span className="text-sm text-gray-300">{new Date(auction.date_added).toLocaleDateString()}</span>
                    </div>

                    {/*<div className="flex justify-between">*/}
                    {/*    <span className="text-sm text-gray-400">Last bidder:</span>*/}
                        {/*<span className="text-sm text-gray-300">{latest?.user.username}</span>*/}
                    {/*</div>*/}
                    <ol>
                        Bid History
                    {bids?.map((bid) => (
                        <li>{bid.price}</li>
                    ))}
                    </ol>
                </div>

                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        detailClick();
                    }}
                    className="w-full mt-2"
                    buttonVariant="clicked"
                >
                    {btnLabel || "View Auction"}
                </Button>
            </div>
        </div>
    );
};

export default Auction;
