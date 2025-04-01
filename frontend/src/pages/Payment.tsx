import { useLocation } from "react-router-dom";
import { useState } from "react";

const Payment = () => {
    const location = useLocation();
    const auction = location.state?.auction || { name: "Unknown Auction", currentBid: "0.00" };

    const [paymentData, setPaymentData] = useState({
        auction_id: auction.id || "",
        card_number: "",
        card_name: "",
        exp_date: "",
        security_code: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Processing payment for:", paymentData);
    };

    return (
        <div>
            <h2>Payment for {auction.name}</h2>
            <p>Amount Due: ${auction.currentBid}</p>

            <form onSubmit={handlePaymentSubmit}>
                <label>Card Number:</label>
                <input type="text" name="card_number" onChange={handleChange} required />

                <label>Card Holder Name:</label>
                <input type="text" name="card_name" onChange={handleChange} required />

                <label>Expiration Date:</label>
                <input type="text" name="exp_date" onChange={handleChange} required />

                <label>Security Code:</label>
                <input type="password" name="security_code" onChange={handleChange} required />

                <button type="submit">Submit Payment</button>
            </form>
        </div>
    );
};

export default Payment;
