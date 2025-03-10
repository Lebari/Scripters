import { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function ForwardBidding() {
  const location = useLocation();
  const auction = location.state?.auction;
  const [bidPrice, setBidPrice] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (!auction) {
    return <div>No auction selected.</div>;
  }

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Call backend endpoint for forward bidding (adjust URL as needed)
    axios
      .post(`http://localhost:5000/bidding/forward/${auction.slug}`, { price: bidPrice })
      .then((response) => {
        if (response.data.status === "success") {
          setMessage("Bid placed successfully!");
        } else {
          setError("Failed to place bid.");
        }
      })
      .catch((err) => {
        setError("Error: " + err.message);
      });
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <h2>Forward Auction Bidding</h2>
      <p>
        <strong>Item:</strong> {auction.name}
      </p>
      <p>
        <strong>Current Bid:</strong> {auction.currentBid}
      </p>
      <form onSubmit={handleBidSubmit}>
        <label htmlFor="bidPrice">Your Bid:</label>
        <input
          id="bidPrice"
          type="number"
          value={bidPrice}
          onChange={(e) => setBidPrice(e.target.value)}
          style={{ marginLeft: "1rem" }}
        />
        <button type="submit" style={{ marginLeft: "1rem" }}>
          Place Bid
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
    </div>
  );
}

export default ForwardBidding;
