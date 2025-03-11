import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SponsorCatalogs.css";

const SponsorCatalogs: React.FC = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(10);
  const [genre, setGenre] = useState("");
  const [type, setType] = useState("music");
  const [catalog, setCatalog] = useState<any[]>([]);

  const handleSearch = async () => {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${genre}&media=${type}&limit=${amount}`
    );
    const data = await response.json();
    setCatalog(data.results);
  };

  return (
    <div className="sponsor-catalogs">
      <nav>
        <button onClick={() => navigate("/catalogs")}>Catalogs</button>
      </nav>
      <h1>Customize Your Product Catalog</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
      >
        <div>
          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Genre:</label>
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          />
        </div>
        <div>
          <label>Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="music">Music</option>
            <option value="movie">Movie</option>
            <option value="podcast">Podcast</option>
            <option value="audiobook">Audiobook</option>
          </select>
        </div>
        <button type="submit">Search</button>
      </form>
      <div className="catalog-results">
        {catalog.map((item) => (
          <div key={item.trackId} className="catalog-item">
            <img src={item.artworkUrl100} alt={item.trackName} />
            <p>{item.trackName}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SponsorCatalogs;