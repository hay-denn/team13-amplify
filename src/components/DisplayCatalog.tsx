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

  const [organizationData, setOrganizationData] =
    useState<OrganizationData | null>(null);

  // The search parameters will update after org data is loaded
  const [amount, setAmount] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // The current catalog being displayed
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [type, setType] = useState("music");
  const [priceToPointRatio, setPriceToPointRatio] = useState(1);
  const [maxPrice, setMaxPrice] = useState(100);

  const url_getOrganization =
    "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

  //Gets the orgnization information
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

  // //Sets the organization data to the local variables
  useEffect(() => {
    if (!organizationData) return;

    setAmount(organizationData.AmountOfProducts);
    setSearchTerm(organizationData.SearchTerm || "");
    setType(organizationData.ProductType || "music");
    setPriceToPointRatio(Number(organizationData.PointDollarRatio) || 1);
    setMaxPrice(Number(organizationData.MaxPrice) || 100);
  }, [organizationData]);

  if (!organizationData) {
    return <div>Loading organization data...</div>;
  }

  // makes the itunes api call and filters it
  const handleSearch = async () => {
    try {
      setCatalog([]);

      const url = `https://itunes.apple.com/search?term=${searchTerm}&media=${type}&limit=${amount}`;

      const response = await axios.get(url);

      // Filter the results based on the max price
      const filteredResults: CatalogItem[] = response.data.results.filter(
        (item: CatalogItem) => item.trackPrice <= maxPrice
      );

      setCatalog(filteredResults);
    } catch (error) {
      console.error("Error fetching catalog:", error);
    }
  };

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

      <button onClick={handleSearch}>Get Catalog</button>

      <h3>Catalog Results</h3>

      <div className="card manage-users-card mt-5">
        <div className="card-body">
          <h5 className="manage-users-title card-title">Catalog Results</h5>
          <p className="card-text">
            Results of your customized catalog search.
          </p>
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
    </div>
  );
};

export default SimpleApiFetcher;
