// Show logged-in user's available dutch auctions and redirect them to catalog page to update

import {Auction as AuctionType} from "../models.ts";
import {useEffect, useState} from "react";
import axios from "axios";
import AuctionSeller from "../components/AuctionSeller.tsx";

export const MyAuctions = () =>{
    const [catalog, setCatalogsList] = useState([]);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(true);

    const getAllAuctions = () =>{
        setLoading(true);
        axios({
            baseURL: import.meta.env.VITE_API_URL,
            url: "me",
            method: "get",
            data:{
                limit: 30,
                offset: 0
            }
        }).then((result) => {
            console.log(result);
            setSuccess(true);
            setCatalogsList(result.data.auctions);
            setLoading(false);
        }).catch((error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
            setLoading(false);
        });
    }
    useEffect(()=>{getAllAuctions();}, []);


    return(
        <div className={"flex flex-col items-center gap-4"}>
            <h1>Your Auctions</h1>
            <div>
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
                    </div>
                ) : (
                    <div className="mb-10">
                        {!success && <p className="text-center text-accent-red mb-4">Failed to retrieve auctions. Please try again.</p>}
                    {/* Auctions grid */}
                        <div className="grid gap-4 grid-cols-3">
                            {catalog.map((auction: AuctionType) => (
                                <AuctionSeller key={auction.id} auction={auction} btnLabel={"Edit Auction"}/>
                                // <Auction key={auction.id} auction={auction} btnLabel={"Edit Auction"}/>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyAuctions;
