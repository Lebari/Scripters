import { useState } from "react";
import axios from "axios";

const Receipt = () => {
    const [purchaseId, setPurchaseId] = useState("");
    const [receipt, setReceipt] = useState<any>(null);
    const [error, setError] = useState("");

    const fetchReceipt = async () => {
        setError("");
        setReceipt(null);
        
        const token = localStorage.getItem("token"); // Assuming JWT token is stored here
        
        if (!purchaseId) {
            setError("Please enter a valid Purchase ID.");
            return;
        }

        try {
            const response = await axios.post(
                "http://127.0.0.1:5000/receipt",
                { purchase_id: purchaseId },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            if (response.data.receipt) {
                setReceipt(response.data.receipt);
            } else {
                setError("Receipt not found.");
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Error fetching receipt.");
        }
    };

    return (
        <div className="receipt-container">
            <h2>Retrieve Purchase Receipt</h2>

            <label>Enter Purchase ID:</label>
            <input
                type="text"
                value={purchaseId}
                onChange={(e) => setPurchaseId(e.target.value)}
                placeholder="Enter Purchase ID"
                className="receipt-input"
            />
            <button onClick={fetchReceipt} className="receipt-button">Get Receipt</button>

            {error && <p className="receipt-error">{error}</p>}
            
            {receipt && (
                <div className="receipt-details">
                    <h3>Receipt</h3>
                    <p><strong>Purchase ID:</strong> {receipt.purchase_id}</p>
                    <p><strong>User:</strong> {receipt.user_name}</p>
                    <p><strong>Auction ID:</strong> {receipt.auction_id}</p>
                    <p><strong>Amount Paid:</strong> ${receipt.amount_paid}</p>
                    <p><strong>Shipping Address:</strong> {receipt.shipping_address}</p>
                    <p><strong>Estimated Delivery:</strong> {receipt.delivery_estimate}</p>
                </div>
            )}
        </div>
    );
};

export default Receipt;
