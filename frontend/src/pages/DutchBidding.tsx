import { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function DutchBidding() {
  const location = useLocation();
  const auction = location.state?.auction;
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");

  if (!auction) {
    return <div>No auction selected.</div>;
  }

  const handleBuyNow = (e: React.FormEvent) => {
    e.preventDefault();
    // Call backend endpoint for Dutch bidding using auction.slug
    axios
      .post(`http://localhost:5000/bidding/dutch/${auction.slug}`, { price })
      .then((response) => {
        if (response.data.status === "success") {
          setPaymentUrl(response.data.payment_url);
        } else {
          setError("Failed to process purchase.");
        }
      })
      .catch((err) => {
        setError("Error: " + err.message);
      });
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <h2>Dutch Auction Purchase</h2>
      <p>
        <strong>Item:</strong> {auction.name}
      </p>
      <p>
        <strong>Current Bid:</strong> {auction.currentBid}
      </p>
      <form onSubmit={handleBuyNow}>
        <label htmlFor="price">Your Price:</label>
        <input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ marginLeft: "1rem" }}
        />
        <button type="submit" style={{ marginLeft: "1rem" }}>
          Buy Now
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {paymentUrl && (
        <p>
          Payment URL: <a href={paymentUrl}>{paymentUrl}</a>
        </p>
      )}
    </div>
  );
}

export default DutchBidding;
