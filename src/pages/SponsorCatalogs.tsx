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
  const [genre, setGenre] = useState("");
  const [type, setType] = useState("music");
  const [catalog, setCatalog] = useState<CatalogItem[]>([]); // ✅ Apply Type
  const [priceToPointRatio, setPriceToPointRatio] = useState(1);
  const [maxPrice, setMaxPrice] = useState(100);
  const [apiUrl, setApiUrl] = useState("");
  const [organizationID, setOrganizationID] = useState<number | null>(null);

  // Fetch Organization ID
  const fetchOrganizationID = async (email: string) => {
    try {
      const encodedEmail = encodeURIComponent(email);
      const response = await axios.get(
        `https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1/sponsor`,
        { params: { UserEmail: encodedEmail } }
      );
      setOrganizationID(response.data.UserOrganization);
    } catch (error) {
      console.error("Error fetching organization ID:", error);
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      const userEmail = auth.user?.profile.email;
      if (userEmail) {
        fetchOrganizationID(userEmail);
      }
    }
  }, [auth]);

  // Fetch Catalog Items
  const handleSearch = async () => {
    try {
      setCatalog([]);

      const url = `https://itunes.apple.com/search?term=${genre}&media=${type}&limit=${amount}`;
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

  // Save Catalog Information
  const handleSaveCatalog = async () => {
    if (organizationID) {
      try {
        await axios.put(
          "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1/organization",
          {
            OrganizationID: organizationID,
            PointDollarRatio: priceToPointRatio,
            AmountOfProducts: amount,
            ProductType: type,
            MaxPrice: maxPrice,
          }
        );
        alert("Catalog information saved successfully!");
      } catch (error) {
        console.error("Error saving catalog information:", error);
        alert("Failed to save catalog information.");
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
              <label>Genre:</label>
              <input
                type="text"
                className="form-control"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
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
              </div>
            ))}
          </div>
          <button className="btn btn-primary mt-3" onClick={handleSaveCatalog}>
            Save Catalog
          </button> {/* 📝 Added button to save catalog */}
        </div>
      </div>
    </div>
  );
};

export default SponsorCatalogs;