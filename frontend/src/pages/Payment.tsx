import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    auction = { name: "Unknown Auction", id: "", slug: "" },
    finalPrice = 0,
    shippingPrice = 0,
    totalPrice = 0,
    expeditedShipping = false,
    user = { username: "Guest" }
  } = location.state || {};

  const [paymentData, setPaymentData] = useState({
    auction_id: auction.id || auction.slug || "",
    card_number: "",
    card_name: "",
    exp_date: "",
    security_code: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
          `http://localhost:5001/payment`,
          {
            ...paymentData,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
      );

      const purchaseId = response.data.payment.payment_id;

      navigate('/receipt', {
        state: { purchaseId }
      });


    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.response?.data?.error || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="payment-container">
        <h2>Payment for {auction.name}</h2>
        <p><strong>Buyer:</strong> {user.username}</p>
        <p><strong>Item Price:</strong> ${finalPrice.toFixed(2)}</p>
        <p><strong>Shipping:</strong> ${shippingPrice.toFixed(2)} ({expeditedShipping ? "Expedited" : "Standard"})</p>
        <p><strong>Total Amount Due:</strong> ${totalPrice.toFixed(2)}</p>

        <form onSubmit={handlePaymentSubmit}>
          <label>Card Number:</label>
          <input type="text" name="card_number" onChange={handleChange} required  maxLength={16}/>

          <label>Card Holder Name:</label>
          <input type="text" name="card_name" onChange={handleChange} required maxLength={50} />

          <label>Expiration Date MMYY:</label>
          <input type="text" name="exp_date" onChange={handleChange} required  maxLength={4}/>

          <label>Security Code XXX:</label>
          <input type="password" name="security_code" onChange={handleChange} required  maxLength={3}/>

          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Submit Payment"}
          </button>
        </form>

        {error && <p className="payment-error">{error}</p>}
      </div>
  );
};

export default Payment;