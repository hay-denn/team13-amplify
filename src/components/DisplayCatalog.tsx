import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Catalog.css";

interface OrganizationData {
  OrganizationID: number;
  OrganizationName: string;
  OrganizationDescription: string;
  PointDollarRatio: string;
  AmountOfProducts: number;
  ProductType: string;
  MaxPrice: string;
  SearchTerm: string;
  HideDescription: number;
  LogoUrl: string | null;
  WebsiteUrl: string | null;
  HideWebsiteUrl: number;
}

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

const SimpleApiFetcher: React.FC = () => {
  const [currOrgId, setCurrOrgId] = useState<number>(13);

  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);

  // Catalog parameters derived from organization data
  const [amount, setAmount] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState("music");
  const [priceToPointRatio, setPriceToPointRatio] = useState(1);
  const [maxPrice, setMaxPrice] = useState(100);

  // pagination
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [page, setPage] = useState(0);

  const url_getOrganization =
    "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

  // 1. Fetch the organization info
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await axios.get(
          `${url_getOrganization}/organization?OrganizationID=${currOrgId}`
        );
        setOrganizationData(response.data);
      } catch (error) {
        console.error("Error fetching organization data:", error);
      }
    };

    fetchOrganization();
  }, [currOrgId]);

  // 2. Update local states whenever org data arrives
  useEffect(() => {
    if (!organizationData) return;
    setAmount(organizationData.AmountOfProducts);
    setSearchTerm(organizationData.SearchTerm || "");
    setType(organizationData.ProductType || "music");
    setPriceToPointRatio(Number(organizationData.PointDollarRatio) || 1);
    setMaxPrice(Number(organizationData.MaxPrice) || 100);
  }, [organizationData]);

  // 3. Build a function to fetch results from iTunes with pagination
  const handleSearch = async (desiredPage: number = page) => {
    try {
      
      // offset = page * amount
      const offset = desiredPage * amount;

      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
        searchTerm
      )}&media=${type}&limit=${amount}&offset=${offset}`;

      const response = await axios.get(url);

      console.log("Response from iTunes API:", response.data); 

      const filteredResults: CatalogItem[] = response.data.results.filter(
        (item: CatalogItem) => item.trackPrice <= maxPrice
      );

      setCatalog(filteredResults);
      setPage(desiredPage);
    } catch (error) {
      console.error("Error fetching catalog:", error);
    }
  };

  // 4. “Next” and “Previous” page handlers
  const handleNextPage = () => {
    handleSearch(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 0) {
      handleSearch(page - 1);
    }
  };

  if (!organizationData) {
    return <div>Loading organization data...</div>;
  }

  return (
    <div style={{ margin: "2rem" }}>
      <p>Organization ID: {currOrgId}</p>
      <button onClick={() => setCurrOrgId((prev) => prev + 1)}>
        Increment Org ID
      </button>
      <button onClick={() => setCurrOrgId((prev) => prev - 1)}>
        Decrement Org ID
      </button>
      <hr />

      {/* Trigger a search on the current (page, searchTerm, etc.) */}
      <button onClick={() => handleSearch(0)}>Update Catalog</button>

      <div className="card organization-card mt-5">
        <div className="card-body">
          {organizationData.LogoUrl && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <img
            src={organizationData.LogoUrl}
            alt={organizationData.OrganizationName}
            className="logo"
            style={{ width: "100px", height: "100px" }}
          />
        </div>
          )}
          <h5 className="organization-title card-title">
        {organizationData.OrganizationName}
          </h5>
          <p className="card-text">{organizationData.OrganizationDescription}</p>
          <p>
        Max Price: ${maxPrice} | Point to Dollar Ratio: {priceToPointRatio}
          </p>
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
                <p>
                  {item.trackName} - ${item.trackPrice} (
                  {(item.trackPrice * priceToPointRatio).toFixed(2)} points)
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
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handlePrevPage}
        disabled={page === 0}
        style={{ marginRight: "10px" }}
      >
        Previous
      </button>
      <button onClick={handleNextPage}>Next</button>

    </div>
  );
};

export default SimpleApiFetcher;
