import { useState, useEffect } from "react";
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

interface Props {
  currentCatalog: number;
}

export const GetCurrentCatalog = ({ currentCatalog }: Props) => {
  const [currOrgId, setCurrOrgId] = useState(currentCatalog);
  const [organizationData, setOrganizationData] =
    useState<OrganizationData | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState("music");
  const [priceToPointRatio, setPriceToPointRatio] = useState(1);
  const [maxPrice, setMaxPrice] = useState(100);

  const [pageSize, setPageSize] = useState(10);

  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");
  const [artistFilter, setArtistFilter] = useState("");

  // Store all fetched results in memory
  const [allResults, setAllResults] = useState<CatalogItem[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [page, setPage] = useState(0);

  const url_getOrganization =
    "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

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

  useEffect(() => {
    if (!organizationData) return;
    setPageSize(organizationData.AmountOfProducts || 10);
    setSearchTerm(organizationData.SearchTerm || "");
    setType(organizationData.ProductType || "music");
    setPriceToPointRatio(Number(organizationData.PointDollarRatio) || 1);
    setMaxPrice(Number(organizationData.MaxPrice) || 100);
  }, [organizationData]);

  const handleFetchAll = async () => {
    try {
      const limit = 50;
      let offset = 0;
      let fetchedItems: CatalogItem[] = [];
      let keepFetching = true;

      while (keepFetching) {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
          searchTerm
        )}&media=${type}&limit=${limit}&offset=${offset}`;

        const response = await axios.get(url);
        const batch = response.data.results as CatalogItem[];

        // If we got zero results, stop
        if (batch.length === 0) {
          keepFetching = false;
        } else {
          fetchedItems = [...fetchedItems, ...batch];
          offset += limit;
          if (offset >= 200) {
            keepFetching = false;
          }
        }
      }

      setAllResults(fetchedItems);
      setPage(0);
    } catch (error) {
      console.error("Error fetching catalog:", error);
    }
  };

  useEffect(() => {
    let filtered = allResults.filter((item) => item.trackPrice <= maxPrice);

    if (artistFilter.trim()) {
      filtered = filtered.filter((item) =>
        item.artistName.toLowerCase().includes(artistFilter.toLowerCase())
      );
    }

    if (sortOrder === "asc") {
      filtered.sort((a, b) => a.trackPrice - b.trackPrice);
    } else if (sortOrder === "desc") {
      filtered.sort((a, b) => b.trackPrice - a.trackPrice);
    }

    // Now we do local pagination
    const startIdx = page * pageSize;
    const endIdx = startIdx + pageSize;
    const pageResults = filtered.slice(startIdx, endIdx);

    setCatalog(pageResults);
  }, [allResults, sortOrder, artistFilter, page, pageSize, maxPrice]);

  // Pagination controls
  const handleNextPage = () => {
    // Only go to next page if there are more items left
    const totalItems = allResults.filter(
      (item) => item.trackPrice <= maxPrice
    ).length;
    const maxPage = Math.floor(totalItems / pageSize);
    if (page < maxPage) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage((prev) => prev - 1);
    }
  };

  if (!organizationData) {
    return <div>Loading organization data...</div>;
  }

  useEffect(() => {
    // Everytime the selected current Id changes, update the variable
    setCurrOrgId(currentCatalog);
  }, [currentCatalog]);

  useEffect(() => {
    if (organizationData) {
      handleFetchAll();
    }
  }, [organizationData]);

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

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: "1rem" }}>Sort by Price:</label>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc" | "")}
          style={{ marginRight: "2rem" }}
        >
          <option value="">None</option>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        <label style={{ marginRight: "1rem" }}>Search by Artist:</label>
        <input
          type="text"
          value={artistFilter}
          onChange={(e) => setArtistFilter(e.target.value)}
          placeholder="Type artist name"
        />
      </div>

      <button onClick={() => handleFetchAll()}>Fetch All Items</button>

      <div className="card organization-card mt-5">
        <div className="card-body">
          {organizationData.LogoUrl && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "1rem",
              }}
            >
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
          <p className="card-text">
            {organizationData.OrganizationDescription}
          </p>
          <p>
            Max Price: ${maxPrice} | Point to Dollar Ratio: {priceToPointRatio}
          </p>
        </div>
      </div>

      <div className="card manage-users-card mt-5">
        <div className="card-body">
          <h5 className="manage-users-title card-title">Catalog Results</h5>
          <p className="card-text"></p>
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
      <p>Page: {page + 1}</p>
    </div>
  );
};

export default GetCurrentCatalog;
