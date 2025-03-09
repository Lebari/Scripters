import axios from "axios";
import {useState} from "react"
import {Auction} from "../models.ts";

const Catalog = () => {
    const [catalogsList, setCatalogsList] = useState([]);
    const [success, setSuccess] = useState(false);

    const getAllAuctions = () =>{
        axios({
            baseURL: "http://localhost:5000",
            url: "catalog",
            method: "get",
        }).then((result) => {
            console.log(result);
            setSuccess(true);
            setCatalogsList(result.data["All Auctions"]);
        }).catch((error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        });
    }

    return(
        <div className={"flex flex-col items-center gap-4"}>
        <h1>Scripters Auction Platform - Catalog</h1>
        <div className="card">
            <button onClick={getAllAuctions }>
                View all auctions
            </button>
            {success? <></>
            : <>Auctions not retrieved.</>}

            <div className={"grid grid-cols-1 gap-4 text-left py-4"}>
            <ul>
            {catalogsList.map((auction: Auction, index) => (
                <li
                    key={index}
                    className="px-3 py-1 hover:text-white hover:font-medium hover:bg-camel cursor-pointer"
                >
                    {auction.item.name} at /{auction.slug} {auction.auction_type}. Duration: {auction.duration}.
                    + Price: {auction.item.price}. Seller: {auction.seller.username}. Added: {auction.date_added}
                </li>))}
            </ul>
            </div>
        </div>
        </div>
    )
}
export default Catalog;