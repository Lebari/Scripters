import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "./bidding.css";

function DutchBidding() {
  const location = useLocation();
  const auction = location.state?.auction;
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  // Use auction?.item?.price (or 0 if undefined) as the initial price
  const [currentPrice, setCurrentPrice] = useState(auction?.currentBid || 0);

  // Connect to backend via Socket.IO to listen for price update events
  useEffect(() => {
    const socket = io("http://localhost:5000");
    socket.on("auction_price_changed", (data: any) => {
      if (auction && data.auction_id === auction.slug) {
        // Update the current price with the new price from the event data
        setCurrentPrice(data.new_price);
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [auction]);

  if (!auction) {
    return (
      <div className="bidding-container">
        <p className="bidding-error">No auction selected.</p>
      </div>
    );
  }

  const handleBuyNow = (e: React.FormEvent) => {
    e.preventDefault();

    // POST to your Dutch auction endpoint using the current price
    axios
      .post(`http://localhost:5000/bidding/dutch/${auction.slug}`, { price: currentPrice })
      .then((response) => {
        if (response.data.status === "success") {
          // On successful purchase, redirect to the auction ended page
          navigate("/auction-ended", { state: { auction, user: location.state?.user } });
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
          <strong>Current Price:</strong> {currentPrice}
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
