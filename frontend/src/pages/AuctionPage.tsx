import React, { useEffect, useState } from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import { Auction as AuctionType } from '../models.ts';
import Button from '../components/Button.tsx';
import axios from "axios";

const AuctionPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { name } = useParams<{ name: string }>();
    const [auction, setAuction] = useState<AuctionType | null>(location.state as AuctionType);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    const goToBid = () => {
        if (!auction) {
            console.error("Auction is not loaded yet.");
            return;
        }
        if(name){
            if (auction.auction_type === "Forward") {
                navigate(import.meta.env.VITE_APP_UC31FWDBIDDING_URL, { state: { auction: auction } });
            } else if (auction.auction_type === "Dutch") {
                // Pass the auction (which now includes the current bid, i.e. item.price) to DutchBidding
                navigate(import.meta.env.VITE_APP_UC32DCHBIDDING_URL, { state: { auction: auction } });
            } else {
                console.log("Unknown auction type:", auction.auction_type);
            }
        }
    };
    
    const getAuction = () => {
        setLoading(true);
        if (location.state) {
            setAuction(location.state as AuctionType);
            setLoading(false);
        } else if (name) {
            getAuctionCall(name);
        }
    };

    const getAuctionCall = (name: string)=>{
        axios({
            baseURL: import.meta.env.VITE_API_URL,
            url: `catalog/${encodeURIComponent(name)}`,
            method: "get",
        }).then(async (result) => {
            console.log(result.data);
            setAuction(result.data.auction);
            setLoading(false);
            setError('');
        }).catch(async (error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
                setError('Failed to load auction details.');
            }
            setLoading(false);
        });
    }

    useEffect(() => {
        getAuction(); 
    }, [name, location.state]);


    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
    );

    if (!auction) return (
        <div className="text-center py-16">
            <h2 className="text-2xl mb-4 text-gold">Auction Not Found</h2>
            <p>Sorry, we couldn't find the auction you're looking for.</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto">
            {error && (
                <div className="bg-accent-red/10 text-accent-red px-4 py-3 rounded-md mb-6 border border-accent-red/20">
                    {error}
                </div>
            )}
            <div className="bg-black-800 border border-gray-800 rounded-lg overflow-hidden shadow-xl mb-8">
                <div className="md:flex">
                    {/* Auction Details */}
                    <div className="w-full p-6 md:w-2/3">
                        <div className="flex justify-between items-start mb-6">
                            <h1 className="text-2xl md:text-3xl font-bold text-gold">{auction.item.name}</h1>
                            <span className={`px-3 py-1 rounded-full text-sm ${
                                auction.auction_type === "Dutch" 
                                    ? "bg-accent-red/10 text-red border border-red/20" 
                                    : "bg-green/10 text-green-light border border-green/20"
                            }`}>
                                {auction.auction_type} Auction
                            </span>
                        </div>

                        <div className="mb-6">
                            <p className="text-3xl font-bold text-gold mb-2">
                                ${auction.item.price.toFixed(0)}
                            </p>
                            <p className="text-sm text-gray-400">Category: {auction.item.category}</p>
                            <p className="text-sm mt-2 text-gray-500">Auction ID: {auction.slug}</p>
                        </div>

                        <div className="border-t border-gray-800 pt-4 mb-6">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-gray-400">Seller</p>
                                    <p className="font-medium text-gray-300">{auction.seller.username}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Time Left</p>
                                    <p className="font-medium text-gray-300">{getTimeLeft()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Added</p>
                                    <p className="font-medium text-gray-300">{new Date(auction.date_added).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Last Updated</p>
                                    <p className="font-medium text-gray-300">{new Date(auction.date_updated).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Bidding Controls */}
                        <div className="relative">
                            {auction.auction_type === "Dutch" ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Button 
                                            onClick={goToBid}
                                            className="px-6 py-3"
                                            buttonVariant="clicked"
                                        >
                                            Buy Now
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Button 
                                            onClick={goToBid}
                                            className="px-6 py-3"
                                            buttonVariant="clicked"
                                        >
                                            Bid on this Auction
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Shipping & Refund Info */}
                    <div className="w-full p-6 md:w-1/3 bg-black-700 bg-opacity-30 border-t md:border-t-0 md:border-l border-gray-800">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold mb-4 text-gold-light">Shipping & Refunds</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium mb-2 text-gray-200">Shipping</h3>
                                    <p className="text-sm text-gray-300">Ships within 2-3 business days from warehouses in Nigeria</p>
                                </div>
                                
                                <div>
                                    <h3 className="font-medium mb-2 text-gray-200">Refund Policy</h3>
                                    <ul className="text-sm text-gray-300 space-y-1 list-disc pl-5">
                                        <li>Refunds allowed within 30 days of receipt</li>
                                        <li>Item must be unopened</li>
                                        <li>No exchanges</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuctionPage;
