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
    axios
      .get("http://localhost:5000/search/")
      .then((res) => {
        if (res.data.status === "success" && res.data.auctions) {
          const normalized = res.data.auctions.map((rawAuc: RawAuction) => normalizeAuction(rawAuc));
          setDisplayedAuctions(normalized);
        }
      })
      .catch((error) => console.error("Error fetching auctions:", error));
  }, []);

  // 3. Searching (GET if keyword empty, else POST), then normalize
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

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
            const normalized = res.data.auctions.map((rawAuc: RawAuction) => normalizeAuction(rawAuc));
            setDisplayedAuctions(applyTypeFilter(normalized));
          }
        })
        .catch((err) => console.error("Error fetching auctions:", err));
    } else {
      axios
        .post("http://localhost:5000/search/", { keyword: keyword.trim() })
        .then((res) => {
          if (res.data.status === "success" && res.data.results) {
            const normalized = res.data.results.map((rawAuc: RawAuction) => normalizeAuction(rawAuc));
            setDisplayedAuctions(applyTypeFilter(normalized));
          }
        })
        .catch((err) => console.error("Error searching auctions:", err));
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
        Auction Search & Display
      </h1>

      <form className="auction-search-display-form" onSubmit={handleSearch}>
        <label htmlFor="keyword">Keyword</label>
        <input
          id="keyword"
          type="text"
          className="auction-search-display-input"
          placeholder="Enter keyword..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

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

        <button type="submit" className="auction-search-display-button">
          Search
        </button>
      </form>

      {displayedAuctions.length === 0 ? (
        <p className="auction-search-display-empty">No auctions found.</p>
      ) : (
        <table className="auction-search-display-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Current Bid</th>
              <th>Auction Type</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {displayedAuctions.map((auction) => (
              <tr key={auction.id}>
                <td>{auction.name}</td>
                <td>{auction.currentBid}</td>
                <td>{auction.auctionType}</td>
                <td>
                  <input
                    type="radio"
                    name="selectedAuction"
                    onChange={() => setSelectedAuctionId(auction.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {displayedAuctions.length > 0 && (
        <div className="auction-search-display-footer">
          <button
            className="auction-search-display-button"
            onClick={handleBid}
            disabled={!selectedAuctionId}
          >
            Bid
          </button>
        </div>
      )}
    </div>
  );
}

export default AuctionSearchDisplay;
