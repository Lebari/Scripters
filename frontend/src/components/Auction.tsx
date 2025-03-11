import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auction as AuctionType } from "../models.ts";
import Button from "./Button.tsx";

interface CatalogItemProps {
    auction: AuctionType;
    btnLabel?: string;
}

const Auction: React.FC<CatalogItemProps> = ({ auction,btnLabel }) => {
    const navigate = useNavigate();
    const isNavigating = useRef(false);

    const detailClick = () => {
        if (isNavigating.current) return;
        isNavigating.current = true;
        navigate(`/catalog/${encodeURIComponent(auction.slug)}`, { state: auction });
    };

    return (
        <div className="cursor-pointer" onClick={detailClick}>
            <div className="mt-2 text-md">
                {auction.item.name}
            </div>

            <div className="text-sm">
                ${auction.item.price}
            </div>

            <div className="text-sm">
                Go to /{auction.slug}
            </div>

            <div className="text-sm">
                Duration: {auction.duration}
            </div>

            <div className="text-sm">
                Type: {auction.auction_type}
            </div>

            <div className="text-sm">
                Seller: {auction.seller.username}
            </div>

            <div className="text-sm">
                Added: {auction.date_added}
            </div>

            <Button
                onClick={detailClick}
                className ="w-full mt-3"
            >{btnLabel || "View Auction"}</Button>
        </div>
    );
};

export default Auction;
