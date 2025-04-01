import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auction as AuctionType } from "../models.ts";
import Button from "./Button.tsx";

interface CatalogItemProps {
    auction: AuctionType;
    btnLabel?: string;
}

const Auction: React.FC<CatalogItemProps> = ({ auction, btnLabel }) => {
    const navigate = useNavigate();
    const isNavigating = useRef(false);

    const detailClick = () => {
        if (isNavigating.current) return;
        isNavigating.current = true;
        navigate(`/catalog/${encodeURIComponent(auction.slug)}`, { state: auction });
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
                        <span className="text-sm text-gray-400">Duration:</span>
                        <span className="text-sm text-gray-300">{auction.duration} hours</span>
                    </div>
                    
                    <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">Seller:</span>
                        <span className="text-sm text-gray-300">{auction.seller.username}</span>
                    </div>
                    
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Added:</span>
                        <span className="text-sm text-gray-300">{new Date(auction.date_added).toLocaleDateString()}</span>
                    </div>
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
