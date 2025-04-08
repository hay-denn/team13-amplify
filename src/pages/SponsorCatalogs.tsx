import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "react-oidc-context";
import "./SponsorCatalogs.css";

// Interface
interface CatalogItem {
  trackId: number;
  trackName: string;
  trackPrice: number | string; // iTunes might return string
  artistName: string;
  collectionName: string;
  releaseDate: string;
  primaryGenreName: string;
  artworkUrl100: string;
  longDescription?: string;
  shortDescription?: string;
}

export const SponsorCatalogs: React.FC = () => {
  const auth = useAuth();

  // State
  const [amount, setAmount] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState("music");
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [priceToPointRatio, setPriceToPointRatio] = useState(0.01);
  const [maxPrice, setMaxPrice] = useState(100);
  const [apiUrl, setApiUrl] = useState("");
  const [organizationID, setOrganizationID] = useState<number | null>(null);

  // ---------------------------
  // 1. Fetch Org Details
  // ---------------------------
  const fetchOrganizationDetails = async (email: string) => {
    try {
      const encodedEmail = encodeURIComponent(email);
      const response = await axios.get(
        "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1/sponsor",
        { params: { UserEmail: encodedEmail } }
      );

      setOrganizationID(response.data.UserOrganization);
      setSearchTerm(response.data.SearchTerm?.trim() || "");
      setPriceToPointRatio(response.data.PointDollarRatio || 0.01);
      setAmount(response.data.AmountOfProducts || 10);
      setType(response.data.ProductType || "music");
      setMaxPrice(response.data.MaxPrice || 100);

      // Fetch if we have a searchTerm
      if (response.data.SearchTerm) {
        fetchCatalogData(
          response.data.SearchTerm,
          response.data.ProductType || "music",
          response.data.AmountOfProducts || 10,
          response.data.MaxPrice || 100
        );
      }
    } catch (error) {
      console.error("Error fetching org details:", error);
    }
  };

  // ---------------------------
  // 2. Convert & Filter Price
  // ---------------------------
  const filterAndDeduplicate = (items: CatalogItem[]): CatalogItem[] => {
    // Filter out invalid or negative prices
    const filtered = items.filter((item) => {
      const priceNum = Number(item.trackPrice);
      if (isNaN(priceNum) || priceNum <= 0 || priceNum > maxPrice) {
        console.warn("Filtering out item with invalid price:", item);
        return false;
      }
      return true;
    });

    // Deduplicate by trackId
    const seen = new Set<number>();
    const unique = filtered.filter((item) => {
      if (seen.has(item.trackId)) {
        console.warn("Removing duplicate item:", item.trackId);
        return false;
      }
      seen.add(item.trackId);
      return true;
    });

    return unique;
  };

  // ---------------------------
  // 3. Fetch Catalog Data
  // ---------------------------
  const fetchCatalogData = async (
    term: string,
    mediaType: string,
    limit: number,
    maxPrice: number
  ) => {
    console.log("Fetching catalog data...");
    if (!term.trim()) {
      console.error("Error: Search term cannot be empty.");
      return;
    }

    try {
      const url = `https://b7tt4s7jl3.execute-api.us-east-1.amazonaws.com/dev1/itunes?term=${encodeURIComponent(
        term
      )}&media=${mediaType}&limit=${limit}`;

      const response = await axios.get(url, {
        headers: { "Content-Type": "application/json" },
      });

      if (!response.data.products || response.data.products.length === 0) {
        console.warn("⚠️ No results found.");
        setCatalog([]);
        return;
      }

      const finalCatalog = filterAndDeduplicate(response.data.products);
      setCatalog(finalCatalog);
    } catch (error) {
      console.error("Error fetching catalog data:", error);
    }
  };

  // ---------------------------
  // 4. useEffect for Org Email
  // ---------------------------
  useEffect(() => {
    if (auth.isAuthenticated) {
      const userEmail = auth.user?.profile.email;
      if (userEmail) {
        fetchOrganizationDetails(userEmail);
      }
    }
  }, [auth]);

  // ---------------------------
  // 5. Handle Search
  // ---------------------------
  const handleSearch = async () => {
    try {
      setCatalog([]);
      const url = `https://itunes.apple.com/search?term=${searchTerm}&media=${type}&limit=${amount}`;
      setApiUrl(url);

      const response = await axios.get(url);
      if (!response.data.results) {
        console.warn("No results array in iTunes response:", response.data);
        return;
      }

      const finalCatalog = filterAndDeduplicate(response.data.results);
      setCatalog(finalCatalog);
    } catch (error) {
      console.error("Error fetching catalog:", error);
    }
  };

  // ---------------------------
  // 6. Save Org Details
  // ---------------------------
  const handleSaveOrganization = async () => {
    if (!organizationID) {
      console.error("Organization ID is not set");
      alert("Organization ID is not set.");
      return;
    }

    try {
      await axios.put(
        "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1/organization",
        {
          OrganizationID: organizationID,
          SearchTerm: searchTerm,
          PointDollarRatio: priceToPointRatio,
          AmountOfProducts: amount,
          ProductType: type,
          MaxPrice: maxPrice,
        }
      );
      alert("Organization information updated successfully!");
    } catch (error) {
      console.error("Error updating organization:", error);
      alert("Failed to update organization information.");
    }
  };

  // ---------------------------
  // 7. Render
  // ---------------------------
  return (
    <div className="container manage-users-container py-3 m-5">
      {/* ====== 7a. Price & Max Price Form ====== */}
      <div className="card manage-users-card mt-5">
        <div className="card-body">
          <h5 className="manage-users-title card-title">
            Set Price to Point Conversion Ratio
          </h5>
          <p className="card-text">Set the conversion ratio for price to points.</p>
          <div className="form-group">
            <label>Price to Point Ratio:</label>
            <input
              type="number"
              className="form-control"
              value={priceToPointRatio}
              onChange={(e) => setPriceToPointRatio(Number(e.target.value))}
            />
          </div>
          <div className="form-group mt-3">
            <label>Max Price:</label>
            <input
              type="number"
              className="form-control"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* ====== 7b. Catalog Search Form ====== */}
      <div className="card manage-users-card mt-5">
        <div className="card-body">
          <h5 className="manage-users-title card-title">
            Customize Your Product Catalog
          </h5>
          <p className="card-text">
            Set the parameters below to customize your catalog.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <div className="form-group">
              <label>Amount:</label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Search Term:</label>
              <input
                type="text"
                className="form-control"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Type:</label>
              <select
                className="form-control"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="all">All</option>
                <option value="music">Music</option>
                <option value="movie">Movie</option>
                <option value="podcast">Podcast</option>
                <option value="audiobook">Audiobook</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary mt-3">
              Search
            </button>
          </form>
          <br />
          {apiUrl && (
            <div className="mt-3">
              <h6>API Call:</h6>
              <p>{apiUrl}</p>
            </div>
          )}
        </div>
      </div>

      {/* ====== 7c. Catalog Results ====== */}
      <div className="card manage-users-card mt-5">
        <div className="card-body">
          <h5 className="manage-users-title card-title">Catalog Results</h5>
          <p className="card-text">Results of your customized catalog search.</p>
          <div className="catalog-results">
            {catalog.map((item, index) => {
              const priceNum = Number(item.trackPrice);
              const finalPrice = isNaN(priceNum) ? 0 : priceNum; // fallback if weird data

              return (
                <div key={`${item.trackId}-${index}`} className="catalog-item">
                  <img src={item.artworkUrl100} alt={item.trackName} />
                  <p>
                    {item.trackName} - $
                    {finalPrice.toFixed(2)} (
                    {(finalPrice * priceToPointRatio).toFixed(2)} points)
                  </p>
                  <div className="catalog-description">
                    <p>
                      <strong>Artist:</strong> {item.artistName}
                    </p>
                    <p>
                      <strong>Collection:</strong> {item.collectionName}
                    </p>
                    <p>
                      <strong>Release Date:</strong>{" "}
                      {new Date(item.releaseDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Genre:</strong> {item.primaryGenreName}
                    </p>
                    <p>
                      {item.longDescription ||
                        item.shortDescription ||
                        "No description available."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="btn btn-primary mt-3" onClick={handleSaveOrganization}>
            Save Organization
          </button>
        </div>
      </div>
    </div>
  );
};

export default SponsorCatalogs;
