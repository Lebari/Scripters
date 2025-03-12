import axios from "axios";
import {useEffect, useState} from "react"
import {Auction as AuctionType} from "../models.ts";
import Auction from  "../components/Auction.tsx"

const Catalog = () => {
    const [catalog, setCatalogsList] = useState([]);
    const [success, setSuccess] = useState(false);

    const getAllAuctions = () =>{
        axios({
            baseURL: "http://localhost:5000",
            url: "catalog/",
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
        <h1>Scripters Auction Platform - Catalog</h1>
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
export default Catalog;