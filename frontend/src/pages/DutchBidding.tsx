import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./bidding.css";
import { useTokenContext } from "../components/TokenContext";
import { useNotificationHelpers } from "../components/NotificationContext";
import { useSocket } from "../components/SocketContext";

function DutchBidding() {
  const location = useLocation();
  const auctionData = location.state?.auction;
  const navigate = useNavigate();
  const { token, user } = useTokenContext();
  const { notifyAuctionWon } = useNotificationHelpers();
  const { socket } = useSocket();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  // Initialize the current price using the normalized auction data
  const [currentPrice, setCurrentPrice] = useState(auctionData?.currentBid || 0);

  useEffect(() => {
    console.log("Auction data received:", auctionData);
  }, [auctionData]);

  // Listen for price change events using the global socket
  useEffect(() => {
    if (!auctionData || !socket) return;

    console.log("Setting up price change listeners for Dutch auction:", auctionData);

    const handlePriceChanged = (data: any) => {
      console.log("Received auction_price_changed event:", data);
      // Compare with auction.id 
      if (auctionData && data.auction_id === auctionData.id) {
        // Update the current price with the new price from the event data
        setCurrentPrice(data.new_price);
        console.log("Price updated to:", data.new_price);
      }
    };

    // Add listener
    socket.on('auction_price_changed', handlePriceChanged);

    // Clean up
    return () => {
      socket.off('auction_price_changed', handlePriceChanged);
    };
  }, [auctionData, socket]);

  if (!auctionData) {
    return (
      <div className="bidding-container">
        <p className="bidding-error">No auction selected.</p>
      </div>
    );
  }

  const handleBuyNow = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is logged in
    if (!token) {
      setError("You must be logged in to purchase this item");
      return;
    }

    // For Dutch auctions, we need to use the raw.slug property if available
    const auctionSlug = auctionData.raw?.slug || auctionData.slug || auctionData.id;
    
    console.log("Sending buy now request for auction slug:", auctionSlug);
    console.log("Current price:", currentPrice);
    console.log("Authorization token:", token);
    
    axios
      .post(
        `http://localhost:5000/bid/dutch/${auctionSlug}`, 
        { price: currentPrice },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      .then((response) => {
        console.log("Buy now response:", response.data);
        if (response.data.status === "success") {
          // Show notification across the app
          notifyAuctionWon(auctionData, currentPrice);
          
          // Set a message for the current page as well
          setMessage("Congratulations! You've successfully purchased this item.");
          setError("");
        } else {
          setError("Failed to process purchase.");
          setMessage("");
        }
      })
      .catch((err) => {
        console.error("Buy now error:", err);
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Error response data:", err.response.data);
          setError(err.response.data.error || `Error: ${err.response.status}`);
        } else {
          setError("Error: " + err.message);
        }
        setMessage("");
      });
  };

  const handleLogin = () => {
    navigate("/login", { 
      state: { 
        returnUrl: location.pathname,
        returnState: location.state 
      } 
    });
  };

  return (
    <div className="bidding-container">
      <h2 className="bidding-heading">Dutch Auction Purchase</h2>
      <div className="bidding-card">
        <h3 className="bidding-item-name">{auctionData.name || (auctionData.raw?.item?.name) || "Unnamed Item"}</h3>
        <p className="bidding-current-bid">
          <strong>Current Price:</strong> ${currentPrice.toFixed(2)}
        </p>

        {!token ? (
          <div>
            <p className="bidding-error">You must be logged in to purchase this item.</p>
            <button 
              className="bidding-button" 
              onClick={handleLogin}
              style={{ marginTop: "1rem" }}
            >
              Log In
            </button>
          </div>
        ) : (
          <form onSubmit={handleBuyNow} className="bidding-form">
            <button type="submit" className="bidding-button">
              Buy Now
            </button>
          </form>
        )}

        {error && token && <p className="bidding-error">{error}</p>}
        {message && <p className="bidding-success">{message}</p>}
      </div>
    </div>
  );
}

export default DutchBidding;
