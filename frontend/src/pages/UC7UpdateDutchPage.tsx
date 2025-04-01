// Show logged-in user's available dutch auctions and redirect them to catalog page to update

import {Auction as AuctionType} from "../models.ts";
import Auction from "../components/Auction.tsx";
import {useEffect, useState} from "react";
import axios from "axios";

export const MyAuctions = () =>{
    const [catalog, setCatalogsList] = useState([]);
    const [success, setSuccess] = useState(false);

    const getAllAuctions = () =>{
        axios({
            baseURL: "http://localhost:5001",
            url: "myauctions",
            method: "get",
        }).then((result) => {
            console.log(result);
            setSuccess(true);
            setCatalogsList(result.data.auctions);
        }).catch((error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        });
    }
    useEffect(()=>{getAllAuctions();}, []);


    return(
        <div className={"flex flex-col items-center gap-4"}>
            <h1>Your Auctions</h1>
            <div>
                {success? <></>
                    : <>Auctions not retrieved.</>}

                {/* Auctions grid */}
                <div className="mb-10">
                    <div className="grid gap-4 grid-cols-3">
                        {catalog.map((auction: AuctionType) => (
                            <Auction key={auction.id} auction={auction}/>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MyAuctions;
