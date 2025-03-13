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
  // Initialize the current price using the auction's current bid (or 0)
  const [currentPrice, setCurrentPrice] = useState(auction?.currentBid || 0);

  // Connect to the backend via Socket.IO and update state when a price change event is received
  useEffect(() => {
    const socket = io("http://localhost:5000", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("auction_price_changed", (data: any) => {
      console.log("Received auction_price_changed event:", data);
      if (auction && data.auction_id === auction.slug) {
        // Update the current price with the new price from the event data
        setCurrentPrice(data.new_price);
      }
    });

    socket.on("connect_error", (error: any) => {
      console.error("Socket connection error:", error);
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
    axios
      .post(`http://localhost:5000/bidding/dutch/${auction.slug}`, { price: currentPrice })
      .then((response) => {
        if (response.data.status === "success") {
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
