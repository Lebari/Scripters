import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Auction as AuctionType } from '../models.ts';
import Button from '../components/Button.tsx';
import axios from "axios";

const EditAuctionPage: React.FC = () => {
    const location = useLocation();
    const { name } = useParams<{ name: string }>();
    const [auction, setAuction] = useState<AuctionType | null>(location.state as AuctionType);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const defaultUploadForm = {
        name: auction?.item.name || "",
        price: auction?.item.price || 0,
        status: auction?.item.status || false,
        category: auction?.item.category || "",
        duration: auction?.duration || 0
    };
    const [uploadForm, setUploadForm]
        = useState(defaultUploadForm);
    const [success, setSuccess] = useState(false);

    const validateForm = (): boolean =>{
        if (!uploadForm.name) { setError("Name must be a non-empty string"); return false;}
        if (uploadForm.price <= 0) { setError("Price must be a positive Integer"); return false;}
        if (uploadForm.duration <= 0) { setError("Duration must be a positive Integer"); return false;}
        if (!uploadForm.category) { setError("Category must be a non-empty string"); return false;}
        return true;
    }

    const update = (event: React.FormEvent) =>{
        console.log(`auction: ${uploadForm.name} price: ${uploadForm.price} ${typeof uploadForm.price} status: ${uploadForm.status}
            category: ${uploadForm.category} duration: ${uploadForm.duration}`)
        const valid = validateForm();
        if (valid && name){
            axios({
                baseURL: import.meta.env.VITE_API_URL,
                url: `catalog/${encodeURIComponent(name)}/update`,
                method: "patch",
                data: {
                    name: uploadForm.name,
                    price: Number.parseInt(String(uploadForm.price)),
                    status: uploadForm.status,
                    category: uploadForm.category,
                    duration: Number.parseInt(String(uploadForm.duration))
                }
            }).then((result) => {
                console.log(result.data);
                setSuccess(true);

            }).catch((error) => {
                setSuccess(false);
                setError(error.response.data.message);
                if (error.response) {
                    console.log(error.response);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                }
            });
        }

        // setUploadForm(defaultUploadForm);

        event.preventDefault();
    }

    const fieldStyle = "border";
    const labelStyle = "text-lg pt-4 pb-2";
    
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

    const updateForm = (event: React.ChangeEvent<HTMLInputElement>) => {
        // handle updating the uploadForm state whenever a field changes
        const {value, name} = event.target
        setUploadForm(prevNote => ({
                ...prevNote, [name]: value
            })
        )
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

    const inputDivStyle = "grid grid-rows-1";

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
                        Editing {auction.item.name}
                        <form>
                        <div className="flex justify-between items-start mb-6">
                            <div className={inputDivStyle}>
                            <label htmlFor={"name"} className={labelStyle}>Name</label>
                            <input type={"text"} name={"name"} value={uploadForm.name} onChange={updateForm}
                                   className={"text-2xl md:text-3xl font-bold text-gold"} maxLength={50}/>
                            </div>

                            <span className={`px-3 py-1 rounded-full text-sm ${
                                auction.auction_type === "Dutch" 
                                    ? "bg-accent-red/10 text-red border border-red/20" 
                                    : "bg-green/10 text-green-light border border-green/20"
                            }`}>
                                {auction.auction_type} Auction
                            </span>
                        </div>

                        <div className="mb-6">
                            <div className={inputDivStyle}>
                                <label htmlFor={"price"} className={labelStyle}>Price</label>
                                <input type={"number"} name={"price"} value={uploadForm.price} onChange={updateForm}
                                       className={fieldStyle} max={5000}/>
                            </div>
                            <div className={inputDivStyle}>
                                <label htmlFor={"category"} className={labelStyle}>Category</label>
                                <input type={"text"} name={"category"} value={uploadForm.category} onChange={updateForm} className={fieldStyle} maxLength={50}/>
                            </div>

                            <p className="text-sm mt-2 text-gray-500">Auction Slug: {auction.slug}</p>
                        </div>

                        <div className="border-t border-gray-800 pt-4 mb-6">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-gray-400">Seller</p>
                                    <p className="font-medium text-gray-300">{auction.seller.username}</p>
                                </div>

                                <div className={inputDivStyle}>
                                    <label htmlFor={"duration"} className={labelStyle}>Duration</label>
                                    <p>in minutes</p>
                                    <input type={"number"} name={"duration"} value={uploadForm.duration} onChange={updateForm} className={fieldStyle} maxLength={50}/>
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

                        </div>
                            <Button
                                onClick={update}
                                className="px-6 py-3 mt-8"
                                buttonVariant="clicked"
                            >
                                Update Auction
                            </Button>

                        </form>
                        {success?
                            <p className={"text-green"}>Auction Updated</p>
                            :
                            <>{error?
                                <p className={"text-red-400"}>{error}</p>
                                :
                                <></>
                            }</>
                        }
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

export default EditAuctionPage;
