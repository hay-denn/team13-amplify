import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../pages/CartContext";
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

  const { addToCart } = useCart();

  const url_getOrganization =
    "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

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

  //Loads the current catalog displayed based on the prop passed in
  //runs when currOrgID changes
  useEffect(() => {
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

  useEffect(() => {
    if (searchTerm.trim()) {
      handleFetchAll();
    }
  }, [searchTerm, type, maxPrice, pageSize]);

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
    setCurrOrgId(currentCatalog);
  }, [currentCatalog]);

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
    return <div>Please Select An Organization</div>;
  }

  //This function handles adding an item to cart

  const handleTestAddItems = () => {
    const testItems = [
      {
        name: "C.O.U.N.T.R.Y.",
        cost: 1.29,
        quantity: 1,
        org: 4,
        id: 977746853,
      },
      { name: "Blown Away", cost: 1.29, quantity: 1, org: 7, id: 510168338 },
      { name: "Blown Away", cost: 1.29, quantity: 1, org: 4, id: 510168338 },
      {
        name: "C.O.U.N.T.R.Y.",
        cost: 1.29,
        quantity: 1,
        org: 7,
        id: 977746853,
      },
    ];
    testItems.forEach(addToCart);
    alert("Test items added to cart!");
  };

  return (
    <div className="catalog-container">
      <hr />

      {/* Filters */}
      <div className="catalog-header">
        <label className="me-2">Sort by Price:</label>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc" | "")}
          className="me-4"
        >
          <option value="">None</option>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        <label className="me-2">Search by Artist:</label>
        <input
          type="text"
          value={artistFilter}
          onChange={(e) => setArtistFilter(e.target.value)}
          placeholder="Type artist name"
        />
      </div>

      <div className="container my-5">
        <div className="row mb-4">
          <div className="col text-center">
            <h5 className="mb-3">Catalog Results</h5>
            <p>
              For organization{" "}
              <strong>{organizationData.OrganizationName}</strong> (ID=
              {organizationData.OrganizationID})
            </p>
            <p>
              Max Price: <strong>${maxPrice}</strong> | Point to Dollar Ratio:{" "}
              <strong>{priceToPointRatio}</strong>
            </p>
            {organizationData.LogoUrl && (
              <div className="my-3">
                <img
                  src={organizationData.LogoUrl}
                  alt={organizationData.OrganizationName}
                  style={{ width: "100px", height: "100px" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Catalog grid */}
        <div className="row">
          {catalog.map((item) => (
            <div key={item.trackId} className="col-sm-6 col-md-4 col-lg-3 mb-4">
              <div className="card h-100 catalog-card">
                <img
                  src={item.artworkUrl100}
                  alt={item.trackName}
                  className="card-img-top"
                />

                <div className="card-body limited-card-height">
                  <h6 className="card-title mb-2">{item.trackName}</h6>
                  <p className="card-text text-muted mb-2">
                    ${item.trackPrice} •{" "}
                    {(item.trackPrice * priceToPointRatio).toFixed(2)} points
                  </p>
                  <p className="mb-1">
                    <strong>Artist:</strong> {item.artistName}
                  </p>
                  <p className="mb-1">
                    <strong>Collection:</strong> {item.collectionName}
                  </p>
                  <p className="mb-1">
                    <strong>Release Date:</strong>{" "}
                    {new Date(item.releaseDate).toLocaleDateString()}
                  </p>
                  <p className="mb-2">
                    <strong>Genre:</strong> {item.primaryGenreName}
                  </p>
                  <p className="card-text">
                    {item.longDescription ||
                      item.shortDescription ||
                      "No description available."}
                  </p>
                </div>
                <button
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={handleTestAddItems}
                >
                  Add To Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <button onClick={handlePrevPage} disabled={page === 0} className="me-2">
        Previous
      </button>
      <button onClick={handleNextPage}>Next</button>
      <p>Page: {page + 1}</p>
      <button onClick={() => handleFetchAll()}>Fetch All Items</button>
    </div>
  );
};

export default GetCurrentCatalog;
