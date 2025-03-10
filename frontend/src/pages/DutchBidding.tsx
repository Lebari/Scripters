import { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./bidding.css";

function DutchBidding() {
  const location = useLocation();
  const auction = location.state?.auction;
  
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (!auction) {
    return (
      <div className="bidding-container">
        <p className="bidding-error">No auction selected.</p>
      </div>
    );
  }

  const handleBuyNow = (e: React.FormEvent) => {
    e.preventDefault();

    // POST to your Dutch auction endpoint without any price input
    axios
      .post(`http://localhost:5000/bidding/dutch/${auction.slug}`, { price: auction.currentBid })
      .then((response) => {
        if (response.data.status === "success") {
          setMessage("Purchase successful!");
          setError("");
        } else {
          setError("Failed to process purchase.");
          setMessage("");
        }
      })
      .catch((err) => {
        setError("Error: " + err.message);
        setMessage("");
      });
  };

  return (
    <div className="bidding-container">
      <h2 className="bidding-heading">Dutch Auction Purchase</h2>
      <div className="bidding-card">
        <h3 className="bidding-item-name">{auction.name}</h3>
        <p className="bidding-current-bid">
          <strong>Current Price:</strong> {auction.currentBid || 0}
        </p>

        <form onSubmit={handleBuyNow} className="bidding-form">
          <button type="submit" className="bidding-button">
            Buy Now
          </button>
        </form>

        {error && <p className="bidding-error">{error}</p>}
        {message && <p className="bidding-success">{message}</p>}
      </div>
    </div>
  );
}

export default DutchBidding;
