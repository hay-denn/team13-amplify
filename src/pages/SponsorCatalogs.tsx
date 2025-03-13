import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "react-oidc-context";
import "./SponsorCatalogs.css";

// Define the Catalog Item Type
interface CatalogItem {
  trackId: number;
  trackName: string;
  trackPrice: number;
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

  const [amount, setAmount] = useState(10);
  const [searchTerm, setSearchTerm] = useState(""); // Will store sponsor's saved search term
  const [type, setType] = useState("music");
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [priceToPointRatio, setPriceToPointRatio] = useState(1);
  const [maxPrice, setMaxPrice] = useState(100);
  const [apiUrl, setApiUrl] = useState("");
  const [organizationID, setOrganizationID] = useState<number | null>(null);

  // 1. Fetch Organization ID and Details (PointDollarRatio, AmountOfProducts, ProductType, MaxPrice, SearchTerm)
  const fetchOrganizationDetails = async (email: string) => {
    try {
      console.log("🔍 Fetching organization details for:", email);

      const encodedEmail = encodeURIComponent(email);
      // This endpoint should return your sponsor's saved settings
      const response = await axios.get(
        "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1/sponsor",
        { params: { UserEmail: encodedEmail } }
      );

      console.log("✅ Organization Details:", response.data);

      // If your API returns data like:
      // {
      //   "UserOrganization": 123,
      //   "PointDollarRatio": 2,
      //   "AmountOfProducts": 5,
      //   "ProductType": "movie",
      //   "MaxPrice": 50,
      //   "SearchTerm": "avengers"
      // }
      // Use them directly. If they don't exist, fallback to defaults.

      setOrganizationID(response.data.UserOrganization);
      setSearchTerm(response.data.SearchTerm?.trim() || "");      // Only set to empty string if no value
      setPriceToPointRatio(response.data.PointDollarRatio || 1);
      setAmount(response.data.AmountOfProducts || 10);
      setType(response.data.ProductType || "music");
      setMaxPrice(response.data.MaxPrice || 100);

      // 2. Use these settings to immediately fetch a catalog
      if (response.data.SearchTerm) {
        fetchCatalogData(
          response.data.SearchTerm,
          response.data.ProductType || "music",
          response.data.AmountOfProducts || 10,
          response.data.MaxPrice || 100
        );
      }
    } catch (error) {
      console.error("❌ Error fetching organization details:", error);
      // If there's no existing data, you can simply not set anything,
      // which will leave your defaults in place.
    }
  };

  // 3. Fetch Catalog Data from your iTunes proxy endpoint
  const fetchCatalogData = async (
    searchTerm: string,
    type: string,
    amount: number,
    maxPrice: number
  ) => {
    if (!searchTerm.trim()) {
      console.error("❌ Error: Search term cannot be empty.");
      return;
    }

    try {
      // This is your custom iTunes proxy API
      const url = `https://b7tt4s7jl3.execute-api.us-east-1.amazonaws.com/dev1/itunes?term=${encodeURIComponent(
        searchTerm
      )}&media=${type}&limit=${amount}`;
      console.log("🔍 Fetching iTunes data from:", url);

      const response = await axios.get(url, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ API Response:", response.data);

      if (!response.data.products || response.data.products.length === 0) {
        console.warn("⚠️ No results found.");
        setCatalog([]);
        return;
      }

      // Filter out any items above the maxPrice
      const filteredResults: CatalogItem[] = response.data.products.filter(
        (item: CatalogItem) => item.trackPrice <= maxPrice
      );

      setCatalog(filteredResults);
    } catch (error) {
      console.error("❌ Error fetching catalog data:", error);
    }
  };

  // 4. As soon as the user is authenticated, load the sponsor's settings from DB
  useEffect(() => {
    if (auth.isAuthenticated) {
      const userEmail = auth.user?.profile.email;
      if (userEmail) {
        fetchOrganizationDetails(userEmail);
      }
    }
  }, [auth]);

  // Optionally fetch new catalog items with local search in the UI
  const handleSearch = async () => {
    try {
      setCatalog([]);

      // This is a direct call to iTunes. If you prefer your iTunes proxy,
      // you can switch it out here the same way as in fetchCatalogData.
      const url = `https://itunes.apple.com/search?term=${searchTerm}&media=${type}&limit=${amount}`;
      setApiUrl(url);

      const response = await axios.get(url);

      // Filter by max price
      const filteredResults: CatalogItem[] = response.data.results.filter(
        (item: CatalogItem) => item.trackPrice <= maxPrice
      );

      setCatalog(filteredResults);
    } catch (error) {
      console.error("Error fetching catalog:", error);
    }
  };

  // 5. Save Organization Data (Including SearchTerm) back to your DB
  const handleSaveOrganization = async () => {
    if (organizationID) {
      try {
        await axios.put(
          "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1/organization",
          {
            OrganizationID: organizationID,
            // Using updated state values:
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
    } else {
      console.error("Organization ID is not set");
      alert("Organization ID is not set.");
    }
  };

  return (
    <div className="container manage-users-container py-3 m-5">
      {/* Price to Point Conversion Ratio */}
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

      {/* Customize Your Product Catalog */}
      <div className="card manage-users-card mt-5">
        <div className="card-body">
          <h5 className="manage-users-title card-title">
            Customize Your Product Catalog
          </h5>
          <p className="card-text">Set the parameters below to customize your catalog.</p>
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

      {/* Display Catalog Results */}
      <div className="card manage-users-card mt-5">
        <div className="card-body">
          <h5 className="manage-users-title card-title">Catalog Results</h5>
          <p className="card-text">Results of your customized catalog search.</p>
          <div className="catalog-results">
            {catalog.map((item: CatalogItem) => (
              <div key={item.trackId} className="catalog-item">
                <img src={item.artworkUrl100} alt={item.trackName} />
                <p>
                  {item.trackName} - ${item.trackPrice} (
                  {(item.trackPrice * priceToPointRatio).toFixed(2)} points)
                </p>
                <div className="catalog-description">
                  <p><strong>Artist:</strong> {item.artistName}</p>
                  <p><strong>Collection:</strong> {item.collectionName}</p>
                  <p>
                    <strong>Release Date:</strong>{" "}
                    {new Date(item.releaseDate).toLocaleDateString()}
                  </p>
                  <p><strong>Genre:</strong> {item.primaryGenreName}</p>
                  <p>
                    {item.longDescription ||
                      item.shortDescription ||
                      "No description available."}
                  </p>
                </div>
              </div>
            ))}
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
