import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "react-oidc-context";
import "./SponsorCatalogs.css";

// ✅ Define the Catalog Item Type
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
  const [searchTerm, setSearchTerm] = useState(""); // ✅ Changed from genre to searchTerm
  const [type, setType] = useState("music");
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [priceToPointRatio, setPriceToPointRatio] = useState(1);
  const [maxPrice, setMaxPrice] = useState(100);
  const [apiUrl, setApiUrl] = useState("");
  const [organizationID, setOrganizationID] = useState<number | null>(null);

  // Fetch Organization ID and Details
  const fetchOrganizationDetails = async (email: string) => {
    try {
      const encodedEmail = encodeURIComponent(email);
      const response = await axios.get(
        `https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1/sponsor`,
        { params: { UserEmail: encodedEmail } }
      );
      setOrganizationID(response.data.UserOrganization);
      setSearchTerm(response.data.SearchTerm || ""); // ✅ Ensure we fetch searchTerm from the DB
      setPriceToPointRatio(response.data.PointDollarRatio || 1);
      setAmount(response.data.AmountOfProducts || 10);
      setType(response.data.ProductType || "music");
      setMaxPrice(response.data.MaxPrice || 100);
      fetchCatalogData(response.data.SearchTerm || "", response.data.ProductType || "music", response.data.AmountOfProducts || 10, response.data.MaxPrice || 100); // ✅ Fetch catalog data
    } catch (error) {
      console.error("Error fetching organization details:", error);
    }
  };

  // Fetch Catalog Data
  const fetchCatalogData = async (searchTerm: string, type: string, amount: number, maxPrice: number) => {
    try {
        // ✅ Replace direct iTunes call with your AWS Lambda API Gateway endpoint
        const url = `https://b7tt4s7jl3.execute-api.us-east-1.amazonaws.com/dev1/itunes?term=${encodeURIComponent(searchTerm)}&media=${type}&limit=${amount}`;

        const response = await axios.get(url, {
            headers: { "Content-Type": "application/json" }, // ✅ Ensure correct headers
        });

        // ✅ Filter by max price
        const filteredResults: CatalogItem[] = response.data.products.filter(
            (item: CatalogItem) => item.trackPrice <= maxPrice
        );

        setCatalog(filteredResults);
    } catch (error) {
        console.error("Error fetching catalog data:", error);
    }
};

  useEffect(() => {
    if (auth.isAuthenticated) {
      const userEmail = auth.user?.profile.email;
      if (userEmail) {
        fetchOrganizationDetails(userEmail);
      }
    }
  }, [auth]);

  // Fetch Catalog Items
  const handleSearch = async () => {
    try {
      setCatalog([]);

      const url = `https://itunes.apple.com/search?term=${searchTerm}&media=${type}&limit=${amount}`;
      setApiUrl(url);

      const response = await axios.get(url);

      // ✅ Filter by max price
      const filteredResults: CatalogItem[] = response.data.results.filter(
        (item: CatalogItem) => item.trackPrice <= maxPrice
      );

      setCatalog(filteredResults);
    } catch (error) {
      console.error("Error fetching catalog:", error);
    }
  };

  // Save Organization Data (Including SearchTerm)
  const handleSaveOrganization = async () => {
    if (organizationID) {
      try {
        await axios.put(
          "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1/organization",
          {
            OrganizationID: organizationID,
            SearchTerm: searchTerm, // ✅ Now saving searchTerm instead of genre
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
              <label>Search Term:</label> {/* ✅ Changed label from Genre to Search Term */}
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

      <div className="card manage-users-card mt-5">
        <div className="card-body">
          <h5 className="manage-users-title card-title">Catalog Results</h5>
          <p className="card-text">Results of your customized catalog search.</p>
          <div className="catalog-results">
            {catalog.map((item: CatalogItem) => (
              <div key={item.trackId} className="catalog-item">
                <img src={item.artworkUrl100} alt={item.trackName} />
                <p>{item.trackName} - ${item.trackPrice} ({(item.trackPrice * priceToPointRatio).toFixed(2)} points)</p>
                <div className="catalog-description">
                  <p><strong>Artist:</strong> {item.artistName}</p>
                  <p><strong>Collection:</strong> {item.collectionName}</p>
                  <p><strong>Release Date:</strong> {new Date(item.releaseDate).toLocaleDateString()}</p>
                  <p><strong>Genre:</strong> {item.primaryGenreName}</p>
                  <p>{item.longDescription || item.shortDescription || "No description available."}</p>
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