import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./bidding.css";
import { useTokenContext } from "../components/TokenContext";

/**
 * AuctionEnded component displayed when:
 * 1. User successfully completes a Dutch auction purchase
 * 2. A Forward auction expires and the user is the winner
 * 3. User is manually redirected to the auction ended page
 */
function AuctionEnded() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useTokenContext();

  // Debug incoming data
  useEffect(() => {
    console.log("AuctionEnded - Location state:", location.state);
    console.log("Current user from context:", currentUser);
  }, [location.state, currentUser]);

  const auction = location.state?.auction;
  const user = location.state?.user || currentUser; // Use passed user or fall back to current user
  const isWinner = location.state?.isWinner ?? true; // Default to true for Dutch auctions
  
  // Use finalPrice from state if available, ensure it's a number
  const rawFinalPrice = location.state?.finalPrice;
  const stateFinalPrice = typeof rawFinalPrice === 'number' ? rawFinalPrice : 
                          (rawFinalPrice ? Number(rawFinalPrice) : undefined);
  
  console.log("Final price from state:", rawFinalPrice, "Converted to:", stateFinalPrice);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<any>(null);
  const [finalPrice, setFinalPrice] = useState<number>(stateFinalPrice || 0);
  const [auctionDetails, setAuctionDetails] = useState<any>(auction);

  // Get additional auction details when component mounts
  useEffect(() => {
    if (!auction) {
      console.log("No auction data in state");
      return;
    }

    console.log("Processing auction data:", auction);
    console.log("Initial final price:", finalPrice, "State final price:", stateFinalPrice);

    const fetchAuctionDetails = async () => {
      setLoading(true);
      try {
        // Get the auction slug (differs based on data structure)
        // Handle all possible data structures
        const auctionSlug = auction.slug || 
                           (auction.auction?.slug) ||
                           (auction.raw?.slug) || 
                           auction.id;
        
        console.log("Using auction slug:", auctionSlug);
        
        if (!auctionSlug) {
          console.error("Could not determine auction identifier from data:", auction);
          setError("Could not determine auction identifier");
          return;
        }

        const response = await axios.get(`http://localhost:5000/catalog/${auctionSlug}`);
        
        console.log("Auction API response:", response.data);
        
        if (response.data.auction) {
          // Update with full auction details
          setAuctionDetails(response.data.auction);
          
          // Calculate final price - use state value if available, otherwise from auction data
          let auctionPrice = stateFinalPrice;
          
          if (!auctionPrice || auctionPrice === 0) {
            auctionPrice = Number(response.data.auction.event?.price) || 
                          Number(response.data.auction.item?.price) ||
                          Number(auction.price) ||
                          Number(auction.currentBid) || 
                          0;
          }
                               
          console.log("Final price determined:", auctionPrice);
          setFinalPrice(auctionPrice);
          
          // For this example, we'll simulate a receipt
          setReceipt({
            id: Math.random().toString(36).substring(2, 15),
            timestamp: new Date().toISOString(),
            item: getItemName(response.data.auction),
            price: auctionPrice,
            type: getAuctionType(response.data.auction),
            buyer: user?.username || "Guest"
          });
        }
      } catch (err: any) {
        console.error("Error fetching auction details:", err);
        setError(`Error retrieving auction details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Always attempt to fetch the latest auction details for accurate pricing
    fetchAuctionDetails();
    
  }, [auction, user, stateFinalPrice, finalPrice]);

  // Helper functions to extract data from different auction structures
  const getItemName = (auctionData: any): string => {
    return auctionData.item?.name || 
           auctionData.name || 
           (auctionData.raw?.item?.name) || 
           "Unknown Item";
  };

  const getAuctionType = (auctionData: any): string => {
    return auctionData.auction_type || 
           auctionData.auctionType || 
           (auctionData.raw?.auction_type) || 
           "Unknown";
  };

  const handleViewReceipt = () => {
    // Navigate to receipt page (to be implemented)
    navigate(`/receipt/${receipt.id}`, { state: { receipt, auction: auctionDetails, user } });
  };

  const handleContinueShopping = () => {
    // Navigate back to catalog
    navigate("/catalog");
  };

  if (!auction) {
    return (
      <div className="bidding-container">
        <h2 className="bidding-heading">Auction Summary</h2>
        <div className="bidding-card">
          <p className="bidding-error">No auction information available.</p>
          <button 
            className="bidding-button" 
            style={{ marginTop: "1rem" }}
            onClick={handleContinueShopping}
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  // Determine auction type
  const auctionType = getAuctionType(auctionDetails || auction);
  const isForwardAuction = auctionType.toLowerCase() === "forward";
  const isDutchAuction = auctionType.toLowerCase() === "dutch";

  const itemName = getItemName(auctionDetails || auction);

  if (loading) {
    return (
      <div className="bidding-container">
        <h2 className="bidding-heading">Auction Summary</h2>
        <div className="bidding-card">
          <p>Loading auction details...</p>
        </div>
      </div>
    );
  }

  // Display username if available
  const buyerName = user?.username || "Guest";
  
  // Make sure finalPrice is displayed properly
  const displayPrice = finalPrice > 0 ? finalPrice : 
                      (auction?.price || auction?.currentBid || 0);

  return (
    <div className="bidding-container">
      <h2 className="bidding-heading">
        {isWinner ? "Congratulations!" : "Auction Ended"}
      </h2>

      <div className="bidding-card">
        <h3 className="bidding-item-name">{itemName}</h3>
        
        {isWinner ? (
          <>
            <div className="auction-success-message">
              {isDutchAuction ? (
                <p>You have successfully purchased this item!</p>
              ) : (
                <p>You won this auction with the highest bid!</p>
              )}
            </div>

            <div className="auction-details">
              <p><strong>Final Price:</strong> ${displayPrice.toFixed(2)}</p>
              <p><strong>Auction Type:</strong> {auctionType}</p>
              <p><strong>Buyer:</strong> {buyerName}</p>
              <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            </div>

            <div className="auction-actions" style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
              {receipt && (
                <button 
                  className="bidding-button" 
                  onClick={handleViewReceipt}
                >
                  View Receipt
                </button>
              )}
              
              <button 
                className="bidding-button" 
                style={{ backgroundColor: "#226F54" }}
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="auction-ended-message">
              <p className="bidding-error">
                This auction has ended and you were not the highest bidder.
              </p>
            </div>
            
            <button 
              className="bidding-button" 
              style={{ marginTop: "1rem" }}
              onClick={handleContinueShopping}
            >
              Back to Catalog
            </button>
          </>
        )}

        {error && <p className="bidding-error">{error}</p>}
      </div>
    </div>
  );
}

export default AuctionEnded;
