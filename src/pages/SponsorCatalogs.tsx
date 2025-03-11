import React, { useState } from "react";
import axios from "axios";
import "./SponsorCatalogs.css";

export const SponsorCatalogs: React.FC = () => {
  const [amount, setAmount] = useState(10);
  const [genre, setGenre] = useState("");
  const [type, setType] = useState("music");
  const [catalog, setCatalog] = useState<any[]>([]);
  const [priceToPointRatio, setPriceToPointRatio] = useState(1);
  const [apiUrl, setApiUrl] = useState("");

  const handleSearch = async () => {
    try {
      setCatalog([]);
      
      const url = `https://itunes.apple.com/search?term=${genre}&media=${type}&limit=${amount}`;
      setApiUrl(url); // Set the API URL for debugging

      const response = await axios.get(url);
      setCatalog(response.data.results);
    } catch (error) {
      console.error("Error fetching catalog:", error);
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
                <option value="music">Music</option>
                <option value="movie">Movie</option>
                <option value="podcast">Podcast</option>
                <option value="audiobook">Audiobook</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
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
            {catalog.map((item) => (
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
        </div>
      </div>
    </div>
  );
};

export default SponsorCatalogs;