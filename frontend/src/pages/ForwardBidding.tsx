import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./bidding.css";
import { useTokenContext } from "../components/TokenContext";
import { useNotificationHelpers } from "../components/NotificationContext";
import { useSocket } from "../components/SocketContext";

function ForwardBidding() {
  const location = useLocation();
  const auction = location.state?.auction;
  const navigate = useNavigate();
  const { token, user } = useTokenContext();
  const { notifyAuctionWon } = useNotificationHelpers();
  const { socket } = useSocket();
  
  const [bidPrice, setBidPrice] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [currentHighestBid, setCurrentHighestBid] = useState(
    auction?.currentBid || auction?.raw?.item?.price || 0
  );

  // Fetch the current highest bid from the backend when component mounts
  useEffect(() => {
    if (!auction) return;
    
    const fetchCurrentBid = async () => {
      try {
        // Get auction slug using consistent resolution logic
        const auctionSlug = auction.slug || auction.raw?.slug || auction.id;
        
        console.log("Fetching current highest bid for auction slug:", auctionSlug);
        
        // Fetch the auction details to get the current highest bid
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/catalog/${encodeURIComponent(auctionSlug)}`
        );
        
        console.log("Auction details for bid:", response.data);
        
        if (response.data.auction) {
          // In the backend, auction.event is set to the highest bid
          // For forward auctions, the latest bid (highest price) becomes the auction.event
          let highestBid = 0;
          
          // Check if there's an event (which would be the highest bid)
          if (response.data.auction.event && response.data.auction.event.price) {
            // This is the highest bid price
            highestBid = Number(response.data.auction.event.price);
            console.log("Found highest bid in auction.event:", highestBid);
          } else {
            // Fall back to item price if no bids yet
            highestBid = Number(response.data.auction.item?.price || 0);
            console.log("No bids yet, using item price:", highestBid);
          }
          
          console.log("Setting current highest bid to:", highestBid);
          setCurrentHighestBid(Number(highestBid));
        }
      } catch (err) {
        console.error("Error fetching current bid:", err);
      }
    };
    
    fetchCurrentBid();
  }, [auction]);

  // Listen for auction expired events on this page only
  useEffect(() => {
    if (!auction || !socket || !user) return;

    console.log("Setting up auction-specific event listeners for:", auction);

    const handleAuctionExpired = (data: any) => {
      console.log("Received auction_expired event:", data);
      
      // Check if this event is for the current auction using consistent slug resolution
      const auctionId = auction.slug || auction.raw?.slug || auction.id;
      // Check if the event matches either by id or slug
      if (auctionId === data.auction_id || auctionId === data.auction_slug) {
        setAuctionEnded(true);
        
        // Check if current user is the winner - notifications will be handled globally by SocketContext
        if (user && data.winner && user.id === data.winner) {
          console.log("Current user is the winner on this page!");
          setIsWinner(true);
        } else {
          console.log("Current user is not the winner");
          setIsWinner(false);
          setMessage("This auction has ended. The winning bid has been selected.");
        }
      }
    };

    // Add listener for this specific page
    socket.on('auction_expired', handleAuctionExpired);

    // Clean up the listener when the component unmounts
    return () => {
      socket.off('auction_expired', handleAuctionExpired);
    };
  }, [auction, user, socket]);

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is logged in
    if (!token) {
      setError("You must be logged in to place a bid");
      return;
    }

    // Check if bid price is valid
    if (!bidPrice || isNaN(Number(bidPrice)) || Number(bidPrice) <= 0) {
      setError("Please enter a valid bid amount");
      return;
    }

    // Parse the bid price to a number
    const numericBidPrice = Number(bidPrice);

    // Check if the bid is a whole number (integer)
    if (!Number.isInteger(numericBidPrice)) {
      setError("Bid amount must be a whole number");
      return;
    }

    // Check if the bid is higher than the current highest bid
    if (numericBidPrice <= currentHighestBid) {
      setError(`Your bid must be higher than ${Math.floor(currentHighestBid)}`);
      return;
    }

    // Get auction slug
    const auctionSlug = auction.raw?.slug || auction.slug || auction.id;
    
    console.log("Sending bid for auction slug:", auctionSlug);
    console.log("Bid price:", numericBidPrice);
    console.log("Authorization token:", token);
    
    // Send bid to the backend
    axios
      .post(
        `http://localhost:5001/bid/forward/${auctionSlug}`, 
        { price: numericBidPrice },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      .then((response) => {
        console.log("Bid response:", response.data);
        if (response.data.status === "success") {
          setMessage("Your bid has been placed successfully!");
          setError("");
          setBidPrice("");
          setCurrentHighestBid(numericBidPrice);
        } else {
          setError("Failed to place bid. Please try again.");
          setMessage("");
        }
      })
      .catch((err) => {
        console.error("Bid error:", err);
        if (err.response) {
          setError(err.response.data.error || `Error ${err.response.status}: ${err.response.statusText}`);
        } else {
          setError("Network error: " + err.message);
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

  if (!auction) {
    return (
      <div className="bidding-container">
        <p className="bidding-error">No auction selected.</p>
      </div>
    );
  }

  if (auctionEnded && !isWinner) {
    return (
      <div className="bidding-container">
        <h2 className="bidding-heading">Auction Ended</h2>
        <div className="bidding-card">
          <h3 className="bidding-item-name">{auction.name || auction.raw?.item?.name}</h3>
          <p className="bidding-error">
            This auction has ended and you were not the highest bidder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bidding-container">
      <h2 className="bidding-heading">Place a Bid</h2>
      <p style={{ color: '#fff', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
        Auction Slug: {auction?.slug || auction?.raw?.slug || auction?.id || "Not available"}
      </p>
      <div className="bidding-card">
        <h3 className="bidding-item-name">{auction.name || auction.raw?.item?.name}</h3>
        <p className="bidding-current-bid">
          <strong>Current Highest Bid:</strong> ${Math.floor(currentHighestBid)}
        </p>

        {!token ? (
          <div>
            <p className="bidding-error">You must be logged in to place a bid.</p>
            <button 
              className="bidding-button" 
              onClick={handleLogin}
              style={{ marginTop: "1rem" }}
            >
              Log In
            </button>
          </div>
        ) : (
          <form onSubmit={handleBidSubmit} className="bidding-form">
            <div className="bidding-input-group">
              <label htmlFor="bidPrice">Your Bid Amount ($):</label>
              <input
                type="number"
                id="bidPrice"
                name="bidPrice"
                value={bidPrice}
                onChange={(e) => setBidPrice(e.target.value)}
                min={Math.floor(currentHighestBid) + 1}
                step="1"
                placeholder={`More than $${Math.floor(currentHighestBid)}`}
                className="bidding-input"
              />
            </div>
            <button type="submit" className="bidding-button">
              Place Bid
            </button>
          </form>
        )}

        {error && token && <p className="bidding-error">{error}</p>}
        {message && <p className="bidding-success">{message}</p>}
      </div>
    </div>
  );
}

export default ForwardBidding;
