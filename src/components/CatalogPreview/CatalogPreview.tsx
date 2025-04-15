import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CatalogPreview.css";

interface CatalogPreviewProps {
  searchTerm: string;
  mediaType?: string;
  limit?: number;     
}

export const CatalogPreview = ({
  searchTerm,
  mediaType = "music",
  limit = 5,
}: CatalogPreviewProps) => {
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCatalogPreview = async () => {
      try {
        if (!searchTerm.trim()) {
          setCatalogItems([]);
          return;
        }
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
          searchTerm
        )}&media=${mediaType}&limit=${limit}&explicit=No`;
        const response = await axios.get(url);
        setCatalogItems(response.data.results);
      } catch (error) {
        console.error("Error fetching catalog preview:", error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchCatalogPreview();
  }, [searchTerm, mediaType, limit]);

  return (
    <div className="catalog-preview">
      <h5>Catalog Preview</h5>
      <button
        className="btn btn-primary view-full-catalog-btn"
        onClick={() => navigate("/catalog")}
      >
        View Full Catalog
      </button>
      <div className="preview-content">
        {loading ? (
          <p>Loading preview...</p>
        ) : (
          <div className="catalog-items">
            {catalogItems.map((item) => (
              <div key={item.trackId} className="catalog-item">
                <img src={item.artworkUrl100} alt={item.trackName} />
                <p>{item.trackName}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPreview;
