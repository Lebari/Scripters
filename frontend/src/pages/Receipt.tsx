import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Receipt = () => {
  const { id: purchaseId } = useParams(); // Gets :id from URL
  const [receipt, setReceipt] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipt = async () => {
      setLoading(true);
      setError("");
      setReceipt(null);

      const token = localStorage.getItem("token");

      if (!purchaseId) {
        setError("Missing purchase ID.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/receipt`,
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
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [purchaseId]);

  return (
    <div className="receipt-container">
      <h2>Purchase Receipt</h2>

      {loading && <p>Loading receipt...</p>}
      {error && <p className="receipt-error">{error}</p>}

      {receipt && (
        <div className="receipt-details">
          <p><strong>Purchase ID:</strong> {receipt.purchase_id}</p>
          <p><strong>Buyer:</strong> {receipt.user_name}</p>
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
