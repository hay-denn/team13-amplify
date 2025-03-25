import React, { useState, useEffect } from "react";

const API_BASE_URL = "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

const SponsorOrganizationsAPI: React.FC = () => {
  // -- States for /status & /organization_count
  const [status, setStatus] = useState<string | null>(null);
  const [organizationCount, setOrganizationCount] = useState<number | null>(null);

  // -- CREATE FIELDS
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createPointDollarRatio, setCreatePointDollarRatio] = useState("");
  const [createAmountOfProducts, setCreateAmountOfProducts] = useState("");
  const [createProductType, setCreateProductType] = useState("");
  const [createMaxPrice, setCreateMaxPrice] = useState("");
  const [createSearchTerm, setCreateSearchTerm] = useState("");

  // New fields
  const [createHideDescription, setCreateHideDescription] = useState(false);
  const [createLogoUrl, setCreateLogoUrl] = useState("");

  const [createResult, setCreateResult] = useState<string | null>(null);

  // -- GET ORG
  const [getID, setGetID] = useState("");
  const [organizationData, setOrganizationData] = useState<any>(null);
  const [getError, setGetError] = useState<string | null>(null);

  // -- UPDATE FIELDS
  const [updateID, setUpdateID] = useState("");
  const [updateName, setUpdateName] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const [updatePointDollarRatio, setUpdatePointDollarRatio] = useState("");
  const [updateAmountOfProducts, setUpdateAmountOfProducts] = useState("");
  const [updateProductType, setUpdateProductType] = useState("");
  const [updateMaxPrice, setUpdateMaxPrice] = useState("");
  const [updateSearchTerm, setUpdateSearchTerm] = useState("");

  // New fields
  const [updateHideDescription, setUpdateHideDescription] = useState("");
  const [updateLogoUrl, setUpdateLogoUrl] = useState("");

  const [updateResult, setUpdateResult] = useState<string | null>(null);

  // -- DELETE
  const [deleteID, setDeleteID] = useState("");
  const [deleteResult, setDeleteResult] = useState<string | null>(null);

  // Fetch API status (GET /status)
  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/status`);
      if (!res.ok) {
        throw new Error(`Status fetch failed: ${res.status}`);
      }
      const data = await res.json();
      setStatus(JSON.stringify(data));
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  // Fetch org count (GET /organization_count)
  const fetchOrganizationCount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/organization_count`);
      if (!res.ok) {
        throw new Error(`Organization count fetch failed: ${res.status}`);
      }
      const data = await res.json();
      setOrganizationCount(data.count);
    } catch (err: any) {
      setOrganizationCount(null);
    }
  };

  // CREATE ORG (POST /organization)
  const handleCreateOrganization = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/organization`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          OrganizationName: createName,
          OrganizationDescription: createDescription,
          PointDollarRatio: createPointDollarRatio,
          AmountOfProducts: createAmountOfProducts,
          ProductType: createProductType,
          MaxPrice: createMaxPrice,
          SearchTerm: createSearchTerm,
          HideDescription: createHideDescription,
          LogoUrl: createLogoUrl || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Create failed: ${response.status}`);
      }

      setCreateResult("Organization created successfully!");

      // Clear inputs
      setCreateName("");
      setCreateDescription("");
      setCreatePointDollarRatio("");
      setCreateAmountOfProducts("");
      setCreateProductType("");
      setCreateMaxPrice("");
      setCreateSearchTerm("");
      setCreateHideDescription(false);
      setCreateLogoUrl("");

      // Optionally refresh organizationCount
      fetchOrganizationCount();
    } catch (error: any) {
      setCreateResult(`Error creating organization: ${error.message}`);
    }
  };

  // GET ORG (GET /organization)
  const handleGetOrganization = async () => {
    try {
      const url = `${API_BASE_URL}/organization?OrganizationID=${encodeURIComponent(getID)}`;
      const response = await fetch(url, { method: "GET" });
      if (!response.ok) {
        throw new Error(`Get failed: ${response.status}, ${await response.text()}`);
      }
      const data = await response.json();
      setOrganizationData(data);
      setGetError(null);
    } catch (error: any) {
      setOrganizationData(null);
      setGetError(`Error fetching organization: ${error.message}`);
    }
  };

  // UPDATE ORG (PUT /organization)
  const handleUpdateOrganization = async () => {
    try {
      // Construct the body, only including fields if they've been filled in
      const requestBody: { [key: string]: any } = { OrganizationID: updateID };

      if (updateName.trim()) requestBody.OrganizationName = updateName;
      if (updateDescription.trim()) requestBody.OrganizationDescription = updateDescription;
      if (updatePointDollarRatio.trim()) requestBody.PointDollarRatio = updatePointDollarRatio;
      if (updateAmountOfProducts.trim()) requestBody.AmountOfProducts = updateAmountOfProducts;
      if (updateProductType.trim()) requestBody.ProductType = updateProductType;
      if (updateMaxPrice.trim()) requestBody.MaxPrice = updateMaxPrice;
      if (updateSearchTerm.trim()) requestBody.SearchTerm = updateSearchTerm;

      // For HideDescription: parse string to boolean if needed
      if (updateHideDescription.trim()) {
        requestBody.HideDescription =
          updateHideDescription.toLowerCase() === "true" ? true : false;
      }
      if (updateLogoUrl.trim()) requestBody.LogoUrl = updateLogoUrl;

      const response = await fetch(`${API_BASE_URL}/organization`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}, ${await response.text()}`);
      }

      setUpdateResult("Organization updated successfully!");
      // Clear inputs
      setUpdateID("");
      setUpdateName("");
      setUpdateDescription("");
      setUpdatePointDollarRatio("");
      setUpdateAmountOfProducts("");
      setUpdateProductType("");
      setUpdateMaxPrice("");
      setUpdateSearchTerm("");
      setUpdateHideDescription("");
      setUpdateLogoUrl("");
    } catch (error: any) {
      setUpdateResult(`Error updating organization: ${error.message}`);
    }
  };

  // DELETE ORG (DELETE /organization)
  const handleDeleteOrganization = async () => {
    try {
      const url = `${API_BASE_URL}/organization?OrganizationID=${encodeURIComponent(deleteID)}`;

      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}, ${await response.text()}`);
      }

      setDeleteResult("Organization deleted successfully!");
      setDeleteID("");

      // Optionally refresh organizationCount
      fetchOrganizationCount();
    } catch (error: any) {
      setDeleteResult(`Error deleting organization: ${error.message}`);
    }
  };

  // Initial load: get status & org count
  useEffect(() => {
    fetchStatus();
    fetchOrganizationCount();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-white p-6 rounded shadow space-y-6">
        <h1 className="text-2xl font-bold text-center">Sponsor Organizations API</h1>

        {/* SECTION: Status & Count */}
        <section>
          <div className="space-y-2">
            <p>
              <strong>Status:</strong> {status !== null ? status : "Loading..."}
            </p>
            <p>
              <strong>Organization Count:</strong>{" "}
              {organizationCount !== null ? organizationCount : "Loading..."}
            </p>
            <button
              onClick={() => {
                fetchStatus();
                fetchOrganizationCount();
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Refresh
            </button>
          </div>
          <div>
            <a
              href={`${API_BASE_URL}/organizations`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              See All Organizations
            </a>
          </div>
        </section>

        {/* SECTION: Create Organization */}
        <section>
          <h2 className="font-semibold text-lg">Create Organization</h2>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Organization Name"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <input
              type="text"
              placeholder="Description"
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <input
              type="text"
              placeholder="PointDollarRatio"
              value={createPointDollarRatio}
              onChange={(e) => setCreatePointDollarRatio(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <input
              type="number"
              placeholder="AmountOfProducts"
              value={createAmountOfProducts}
              onChange={(e) => setCreateAmountOfProducts(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <input
              type="text"
              placeholder="ProductType"
              value={createProductType}
              onChange={(e) => setCreateProductType(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <input
              type="text"
              placeholder="MaxPrice"
              value={createMaxPrice}
              onChange={(e) => setCreateMaxPrice(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <input
              type="text"
              placeholder="SearchTerm"
              value={createSearchTerm}
              onChange={(e) => setCreateSearchTerm(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />

            {/* New Fields */}
            <div className="flex items-center space-x-2">
              <label>Hide Description?</label>
              <input
                type="checkbox"
                checked={createHideDescription}
                onChange={(e) => setCreateHideDescription(e.target.checked)}
              />
            </div>
            <input
              type="text"
              placeholder="LogoUrl (optional)"
              value={createLogoUrl}
              onChange={(e) => setCreateLogoUrl(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />

            <button
              onClick={handleCreateOrganization}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create
            </button>

            {createResult && (
              <p className="text-sm text-green-600">{createResult}</p>
            )}
          </div>
        </section>

        {/* SECTION: Get Organization */}
        <section>
          <h2 className="font-semibold text-lg">Get Organization</h2>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Organization ID"
              value={getID}
              onChange={(e) => setGetID(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <button
              onClick={handleGetOrganization}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Get
            </button>
            {organizationData && (
              <div className="bg-gray-100 p-3 rounded mt-2 text-left">
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(organizationData, null, 2)}
                </pre>
              </div>
            )}
            {getError && <p className="text-sm text-red-600">{getError}</p>}
          </div>
        </section>

        {/* SECTION: Update Organization */}
        <section>
          <h2 className="font-semibold text-lg">Update Organization</h2>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Organization ID"
              value={updateID}
              onChange={(e) => setUpdateID(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <input
              type="text"
              placeholder="New Organization Name"
              value={updateName}
              onChange={(e) => setUpdateName(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <input
              type="text"
              placeholder="New Description"
              value={updateDescription}
              onChange={(e) => setUpdateDescription(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <input
              type="text"
              placeholder="New PointDollarRatio"
              value={updatePointDollarRatio}
              onChange={(e) => setUpdatePointDollarRatio(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <input
              type="number"
              placeholder="New AmountOfProducts"
              value={updateAmountOfProducts}
              onChange={(e) => setUpdateAmountOfProducts(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <input
              type="text"
              placeholder="New ProductType"
              value={updateProductType}
              onChange={(e) => setUpdateProductType(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <input
              type="text"
              placeholder="New MaxPrice"
              value={updateMaxPrice}
              onChange={(e) => setUpdateMaxPrice(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <input
              type="text"
              placeholder="New SearchTerm"
              value={updateSearchTerm}
              onChange={(e) => setUpdateSearchTerm(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />

            {/* New Fields */}
            <input
              type="text"
              placeholder="HideDescription (true/false)"
              value={updateHideDescription}
              onChange={(e) => setUpdateHideDescription(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <input
              type="text"
              placeholder="LogoUrl"
              value={updateLogoUrl}
              onChange={(e) => setUpdateLogoUrl(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />

            <button
              onClick={handleUpdateOrganization}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Update
            </button>
            {updateResult && (
              <p className="text-sm text-green-600">{updateResult}</p>
            )}
          </div>
        </section>

        {/* SECTION: Delete Organization */}
        <section>
          <h2 className="font-semibold text-lg">Delete Organization</h2>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Organization ID to Delete"
              value={deleteID}
              onChange={(e) => setDeleteID(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded"
            />
            <button
              onClick={handleDeleteOrganization}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete
            </button>
            {deleteResult && (
              <p className="text-sm text-green-600">{deleteResult}</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SponsorOrganizationsAPI;
