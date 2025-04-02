import axios from "axios";
import {useEffect, useState} from "react"
import {Auction as AuctionType} from "../models.ts";
import Auction from  "../components/Auction.tsx"
import Button from "../components/Button.tsx";

const Catalog = () => {
    const [catalog, setCatalogsList] = useState([]);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(20);

    const loadMore =()=>{
        setLoading(true);
        axios({
            baseURL: import.meta.env.VITE_API_URL,
            url: "catalog/",
            method: "get",
            params:{
                limit: limit,
                offset: offset,
                active: 1
            }
        }).then((result) => {
            if(!result) {
                setLimit(0);
                console.log("No more results to display");
                return;
            }
            console.log(result);
            setSuccess(true);
            const newCatalog = catalog.concat(result.data.auctions)
            setCatalogsList(newCatalog);
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

    const getAllAuctions = () =>{
        setLoading(true);
        axios({
            baseURL: import.meta.env.VITE_API_URL,
            url: "catalog/",
            method: "get",
            params:{
                limit: limit,
                offset: offset,
                active: 1
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
        <div className="w-full">
            <div className="text-center mb-12">
                <h1 className="text-2xl md:text-4xl font-bold mb-4 gold-shimmer">Scripters Auction Platform</h1>
                <div className="w-24 h-1 bg-gradient-to-r from-gold-dark to-gold-light mx-auto my-4 rounded-full"></div>
                <p className="text-lg text-gray-300">Discover exceptional items at premium prices</p>
            </div>
                <div>
                    {!loading && !success && <p className="text-center text-accent-red mb-4">Failed to retrieve auctions. Please try again.</p>}

                    {/* Auctions grid */}
                    <div className="mb-10">
                        {catalog.length === 0 && success ? (
                            <div className="text-center py-16 border border-gray-800 rounded-lg bg-black-800">
                                <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                </svg>
                                <p className="text-xl font-medium text-gray-300 mb-2">No auctions available</p>
                                <p className="text-gray-400">Check back soon for new listings</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 auto-rows-auto">
                                {catalog.map((auction: AuctionType) => (
                                    <Auction key={auction.id} auction={auction}/>
                                ))}
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
                        </div>
                    ) : <Button onClick={() => {setOffset((offset + limit)); loadMore();}}>
                    View {limit} More Results</Button>}
                </div>
        </div>
    )
}
export default Catalog;