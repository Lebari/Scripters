import { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./bidding.css";

function ForwardBidding() {
  const location = useLocation();
  const auction = location.state?.auction;
  
  const [bidPrice, setBidPrice] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (!auction) {
    return (
      <div className="bidding-container">
        <p className="bidding-error">No auction selected.</p>
      </div>
    );
  }

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate bid price: must be a number and higher than the current bid.
    const bid = parseFloat(bidPrice);
    const current = parseFloat(auction.currentBid) || 0;
    if (isNaN(bid) || bid <= current) {
      setError("Your bid must be higher than the current bid.");
      setMessage("");
      return;
    }

    // POST to forward bidding endpoint
    axios
      .post(`http://localhost:5000/bidding/forward/${auction.slug}`, { price: bidPrice })
      .then((response) => {
        if (response.data.status === "success") {
          setMessage("Bid placed successfully!");
          setError("");
        } else {
          setError("Failed to place bid.");
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
      <h2 className="bidding-heading">Forward Auction Bidding</h2>
      <div className="bidding-card">
        <h3 className="bidding-item-name">{auction.name}</h3>
        <p className="bidding-current-bid">
          <strong>Current Bid:</strong> {auction.currentBid || 0}
        </p>

        <form onSubmit={handleBidSubmit} className="bidding-form">
          <label htmlFor="bidPrice" className="bidding-label">
            Your Bid:
          </label>
          <input
            id="bidPrice"
            type="number"
            className="bidding-input"
            placeholder="Enter your bid"
            value={bidPrice}
            onChange={(e) => setBidPrice(e.target.value)}
          />
          <button type="submit" className="bidding-button">
            Place Bid
          </button>
        </form>

        {error && <p className="bidding-error">{error}</p>}
        {message && <p className="bidding-success">{message}</p>}
      </div>
    </div>
  );
}

export default ForwardBidding;
