import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useCart } from "../pages/CartContext";
import "./Catalog.css";
import { useAuth } from "react-oidc-context";

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
  trackExplicitness: string;
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
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState("music");
  const [priceToPointRatio, setPriceToPointRatio] = useState(1);
  const [maxPrice, setMaxPrice] = useState(100);

  // maxProducts is set from organizationData.AmountOfProducts.
  const [maxProducts, setMaxProducts] = useState(100);
  
  // pageSize is used for pagination of the final (limited) results.
  const pageSize = 12;
  const [page, setPage] = useState(0);

  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");
  const [artistFilter, setArtistFilter] = useState("");

  // Store all fetched results.
  const [allResults, setAllResults] = useState<CatalogItem[]>([]);
  const { addToCart } = useCart();
  const auth = useAuth();

  const url_getOrganization = "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

  // Fetch organization data.
  const fetchOrganization = async () => {
    try {
      console.log(`${url_getOrganization}/organization?OrganizationID=${currOrgId}`);
      const response = await axios.get(
        `${url_getOrganization}/organization?OrganizationID=${currOrgId}`
      );
      setOrganizationData(response.data);
    } catch (error) {
      console.error("Error fetching organization data:", error);
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, [currOrgId]);

  // Once organization data is loaded, update related state.
  useEffect(() => {
    if (!organizationData) return;
    setMaxProducts(organizationData.AmountOfProducts || 10);
    setSearchTerm(organizationData.SearchTerm || "pop");
    setType(organizationData.ProductType || "music");
    setPriceToPointRatio(Number(organizationData.PointDollarRatio) || 1);
    setMaxPrice(Number(organizationData.MaxPrice) || 100);
  }, [organizationData]);

  // Fetch catalog items whenever search term, type, max price, or maxProducts changes.
  useEffect(() => {
    if (searchTerm.trim()) {
      handleFetchAll();
    }
  }, [searchTerm, type, maxPrice, maxProducts]);

  // Reset pagination when sort or filter changes.
  useEffect(() => {
    setPage(0);
  }, [sortOrder, artistFilter]);

  // Fetch items from iTunes. If there are not enough results in one call, the loop will fetch additional batches
  // but the final result will be limited to maxProducts items.
  const handleFetchAll = async () => {
    try {
      const limit = maxProducts; // Use maxProducts as the per‑call limit.
      let offset = 0;
      let fetchedItems: CatalogItem[] = [];
      let keepFetching = true;

      while (keepFetching) {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
          searchTerm
        )}&media=${type}&limit=${limit}&offset=${offset}&explicit=No`;
  
        const response = await axios.get(url);
        const batch = response.data.results as CatalogItem[];
  
        if (batch.length === 0) {
          keepFetching = false;
        } else {
          fetchedItems = [...fetchedItems, ...batch];
          offset += limit;
          // Optionally, prevent too many requests.
          if (offset >= 200) {
            keepFetching = false;
          }
          // If we already have enough items, we can stop.
          if (fetchedItems.length >= maxProducts) {
            keepFetching = false;
          }
        }
      }
  
      // Deduplicate items by trackId.
      const seen = new Set<number>();
      const uniqueItems = fetchedItems.filter((item) => {
        if (seen.has(item.trackId)) return false;
        seen.add(item.trackId);
        return true;
      });
  
      // Filter out explicit content (case-insensitive).
      const cleanItems = uniqueItems.filter((item) => {
        const explicitness = item.trackExplicitness || "";
        return explicitness.toLowerCase() !== "explicit";
      });
  
      // Limit final items to maxProducts.
      const finalItems = cleanItems.slice(0, maxProducts);
  
      setAllResults(finalItems);
    } catch (error) {
      console.error("Error fetching catalog:", error);
    }
  };

  // Update current organization ID if the currentCatalog prop changes.
  useEffect(() => {
    setCurrOrgId(currentCatalog);
  }, [currentCatalog]);

  // Compute the filtered, sorted, and paginated catalog.
  const catalog = useMemo(() => {
    let filtered = allResults.filter((item) => {
      const price = Number(item.trackPrice);
      return price > 0 && price <= maxPrice;
    });

    if (artistFilter.trim()) {
      filtered = filtered.filter((item) =>
        item.artistName.toLowerCase().includes(artistFilter.toLowerCase())
      );
    }

    if (sortOrder === "asc") {
      filtered.sort((a, b) => Number(a.trackPrice) - Number(b.trackPrice));
    } else if (sortOrder === "desc") {
      filtered.sort((a, b) => Number(b.trackPrice) - Number(a.trackPrice));
    }

    const startIdx = page * pageSize;
    const endIdx = startIdx + pageSize;
    return filtered.slice(startIdx, endIdx);
  }, [allResults, sortOrder, artistFilter, page, pageSize, maxPrice]);

  // Pagination controls.
  const handleNextPage = () => {
    const totalItems = allResults.filter(
      (item) =>
        Number(item.trackPrice) > 0 &&
        Number(item.trackPrice) <= maxPrice &&
        item.trackExplicitness.toLowerCase() !== "explicit"
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

  // Add an item to the cart.
  const handleTestAddItems = (item: CatalogItem) => {
    const userEmail = auth.user?.profile.email || "";
    const impersonationData = localStorage.getItem("impersonatingDriver");
    const impersonatedDriver = impersonationData ? JSON.parse(impersonationData) : null;

    const driverEmail = impersonatedDriver ? impersonatedDriver.email : userEmail;
    const sponsorOrgID = impersonatedDriver
      ? impersonatedDriver.sponsorOrgID
      : organizationData?.OrganizationID;

    if (!driverEmail || !sponsorOrgID) {
      alert("Unable to add item to cart. Missing driver or organization information.");
      return;
    }

    const cartItem = {
      name: item.trackName,
      cost: item.trackPrice * priceToPointRatio,
      quantity: 1,
      org: sponsorOrgID,
      id: item.trackId,
      driverEmail,
    };

    addToCart(cartItem);
    alert("Item Added To Cart!");
  };

  return (
    <div className="catalog-container">
      <hr />
      <div className="container-fluid my-0">
        {/* Filters */}
        <div className="d-flex align-items-center mb-3">
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
        <div className="row mb-3">
          <div className="col text-center">
            <span>
              Max Price: <strong>${maxPrice}</strong> | Point to Dollar Ratio:{" "}
              <strong>{priceToPointRatio}</strong> | Organization Category:{" "}
              {!organizationData.SearchTerm ? (
                <b>Your Org Has Selected The Default Catalog</b>
              ) : (
                <b>{organizationData.SearchTerm}</b>
              )}
            </span>
          </div>
        </div>
        {/* Catalog grid */}
        <div className="row">
          {catalog.map((item) => {
            const price = Number(item.trackPrice);
            return (
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
                      ${price.toFixed(2)} • {(price * priceToPointRatio).toFixed(2)} points
                    </p>
                    <p className="mb-1">
                      <strong>Artist:</strong> {item.artistName}
                    </p>
                    <p className="mb-1">
                      <strong>Collection:</strong> {item.collectionName}
                    </p>
                    <p className="mb-1">
                      <strong>Release Date:</strong> {new Date(item.releaseDate).toLocaleDateString()}
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
                    onClick={() => handleTestAddItems(item)}
                  >
                    Add To Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Pagination */}
      <button onClick={handlePrevPage} disabled={page === 0} className="me-2">
        Previous
      </button>
      <button onClick={handleNextPage}>Next</button>
      <p>Page: {page + 1}</p>
      <button onClick={handleFetchAll}>Fetch All Items</button>
    </div> 
  );
};

export default GetCurrentCatalog;
