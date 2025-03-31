import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Auction as AuctionType } from '../models.ts';
import Button from '../components/Button.tsx';
import axios from "axios";

const AuctionPage: React.FC = () => {
    const location = useLocation();
    const { name } = useParams<{ name: string }>();
    const [auction, setAuction] = useState<AuctionType | null>(location.state as AuctionType);
    const [popupVisible, setPopupVisible] = useState(false); 
    const [priceInput, setPriceInput] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                setPopupVisible(true); 
                setTimeout(() => setPopupVisible(false), 800); 
            }).catch(async (error) => {
                if (error.response) {
                    console.log(error.response);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                    setError('Failed to place bid. Please try again.');
                }
            });
        } catch (error) {
            console.error("Failed to bid:", error);
            setError('An unexpected error occurred.');
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
                setPopupVisible(true); 
                setTimeout(() => setPopupVisible(false), 800); 
                getAuctionCall(name);
                setError('');
            }).catch(async (error) => {
                if (error.response) {
                    console.log(error.response);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                    setError('Failed to update price. Please try again.');
                }
            });
        } catch (error) {
            console.error("Failed to bid:", error);
            setError('An unexpected error occurred.');
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
            baseURL: "http://localhost:5000",
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

    const updateForm = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target
        setPriceInput(Number.parseInt(value));
        console.log(priceInput);
    }

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
                                ${auction.item.price.toFixed(2)}
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
                                    <p className="text-sm text-gray-400">Duration</p>
                                    <p className="font-medium text-gray-300">{auction.duration} hours</p>
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
                                    <label className="block text-sm font-medium text-gold-light">
                                        Set New Price
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative rounded-md shadow-sm flex-1">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-400 sm:text-sm">$</span>
                                            </div>
                                            <input
                                                type="number"
                                                name="price"
                                                value={priceInput}
                                                onChange={updateForm}
                                                className="bg-black-900 border border-gray-700 focus:ring-gold focus:border-gold block w-full pl-7 pr-12 py-3 sm:text-sm rounded-md"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <Button 
                                            onClick={handleDutchUpdate}
                                            className="px-6 py-3"
                                            buttonVariant="clicked"
                                        >
                                            Update Price
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gold-light">
                                        Place Your Bid
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative rounded-md shadow-sm flex-1">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-400 sm:text-sm">$</span>
                                            </div>
                                            <input
                                                type="number"
                                                name="price"
                                                value={priceInput}
                                                onChange={updateForm}
                                                className="bg-black-900 border border-gray-700 focus:ring-gold focus:border-gold block w-full pl-7 pr-12 py-3 sm:text-sm rounded-md"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <Button 
                                            onClick={handleBid}
                                            className="px-6 py-3"
                                            buttonVariant="clicked"
                                        >
                                            Place Bid
                                        </Button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Success Popup */}
                            {popupVisible && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white text-green-dark px-6 py-4 rounded-md shadow-[0_0_20px_rgba(34,111,84,0.4)] border border-green">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="font-bold text-black-700">Success!</span>
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
