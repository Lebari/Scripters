import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AuctionSearchDisplay.css";

interface RawAuction {
  // The shape of your existing backend data
  id: string;
  auction_type?: string;  // e.g., "Forward" or "Dutch"
  item?: {
    id: string;
    name: string;
    price: number; // ensure price is here
    // other item fields...
  };
  bids?: any[]; // or a typed array if you know the shape
  is_active?: boolean; // Add this field to track active status
  [key: string]: any; // fallback for unknown fields
}

interface Auction {
  // The shape your table expects
  id: string;
  name: string;
  auctionType: string;
  currentBid: number;
  raw: RawAuction; // store the original data if needed
}

function AuctionSearchDisplay() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [auctionType, setAuctionType] = useState("All");
  const [displayedAuctions, setDisplayedAuctions] = useState<Auction[]>([]);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. Helper to transform the raw Auction data into the shape your table expects
  function normalizeAuction(raw: RawAuction): Auction {
    const name = raw.item?.name ?? "Unnamed";
    const aType = raw.auction_type ?? "Unknown";
    // Use the item's price as the current bid
    const cBid = raw.item?.price || 0;

    return {
      id: raw.id,
      name,
      auctionType: aType,
      currentBid: cBid,
      raw // keep the original data if you need it
    };
  }

  // 2. Fetch all auctions on mount
  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/search/")
      .then((res) => {
        if (res.data.status === "success" && res.data.auctions) {
          // Filter for active auctions only
          const activeAuctions = res.data.auctions.filter((auction: RawAuction) => auction.is_active);
          const normalized = activeAuctions.map((rawAuc: RawAuction) => normalizeAuction(rawAuc));
          setDisplayedAuctions(normalized);
        }
      })
      .catch((error) => console.error("Error fetching auctions:", error))
      .finally(() => setLoading(false));
  }, []);

  // 3. Searching (GET if keyword empty, else POST), then normalize
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSelectedAuctionId(null); // Reset selection when searching

    // Filter on auctionType client-side
    const applyTypeFilter = (list: Auction[]) => {
      if (auctionType === "All") return list;
      return list.filter((a) => a.auctionType === auctionType);
    };

    if (keyword.trim() === "") {
      axios
        .get("http://localhost:5000/search/")
        .then((res) => {
          if (res.data.status === "success" && res.data.auctions) {
            // Filter for active auctions only
            const activeAuctions = res.data.auctions.filter((auction: RawAuction) => auction.is_active);
            const normalized = activeAuctions.map((rawAuc: RawAuction) => normalizeAuction(rawAuc));
            setDisplayedAuctions(applyTypeFilter(normalized));
          }
        })
        .catch((err) => console.error("Error fetching auctions:", err))
        .finally(() => setLoading(false));
    } else {
      axios
        .post("http://localhost:5000/search/", { keyword: keyword.trim() })
        .then((res) => {
          if (res.data.status === "success" && res.data.results) {
            // Filter for active auctions only
            const activeAuctions = res.data.results.filter((auction: RawAuction) => auction.is_active);
            const normalized = activeAuctions.map((rawAuc: RawAuction) => normalizeAuction(rawAuc));
            setDisplayedAuctions(applyTypeFilter(normalized));
          }
        })
        .catch((err) => console.error("Error searching auctions:", err))
        .finally(() => setLoading(false));
    }
  };

  // 4. Single Bid button
  const handleBid = () => {
    const selectedAuction = displayedAuctions.find((a) => a.id === selectedAuctionId);
    if (!selectedAuction) return;

    if (selectedAuction.auctionType === "Forward") {
      navigate(import.meta.env.VITE_APP_UC31FWDBIDDING_URL, { state: { auction: selectedAuction } });
    } else if (selectedAuction.auctionType === "Dutch") {
      // Pass the auction (which now includes the current bid, i.e. item.price) to DutchBidding
      navigate(import.meta.env.VITE_APP_UC32DCHBIDDING_URL, { state: { auction: selectedAuction } });
    } else {
      console.log("Unknown auction type:", selectedAuction.auctionType);
    }
  };

  return (
    <div className="auction-search-display-container">
      <h1 className="auction-search-display-heading">
        Find Auctions
      </h1>

      <form className="auction-search-display-form" onSubmit={handleSearch}>
        <div className="form-group">
          <label htmlFor="keyword">Keyword</label>
          <input
            id="keyword"
            type="text"
            className="auction-search-display-input"
            placeholder="Enter keyword..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="auctionType">Auction Type</label>
          <select
            id="auctionType"
            className="auction-search-display-select"
            value={auctionType}
            onChange={(e) => setAuctionType(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Dutch">Dutch</option>
            <option value="Forward">Forward</option>
          </select>
        </div>

        <button type="submit" className="auction-search-display-button">
          {loading ? "Searching..." : "Search Auctions"}
        </button>
      </form>

      {loading ? (
        <p className="auction-search-display-empty">Loading auctions...</p>
      ) : displayedAuctions.length === 0 ? (
        <p className="auction-search-display-empty">No auctions found matching your criteria.</p>
      ) : (
        <>
          <div className="table-container">
            <table className="auction-search-display-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Current Bid ($)</th>
                  <th>Auction Type</th>
                  <th>Select</th>
                </tr>
              </thead>
              <tbody>
                {displayedAuctions.map((auction) => (
                  <tr 
                    key={auction.id}
                    className={selectedAuctionId === auction.id ? "selected-row" : ""}
                    onClick={() => setSelectedAuctionId(auction.id)}
                  >
                    <td>{auction.name}</td>
                    <td>${auction.currentBid.toFixed(2)}</td>
                    <td>{auction.auctionType}</td>
                    <td>
                      <input
                        type="radio"
                        name="selectedAuction"
                        checked={selectedAuctionId === auction.id}
                        onChange={() => {}}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="auction-search-display-footer">
            <button
              className="auction-search-display-button"
              onClick={handleBid}
              disabled={!selectedAuctionId}
            >
              Bid on Selected Auction
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AuctionSearchDisplay;
