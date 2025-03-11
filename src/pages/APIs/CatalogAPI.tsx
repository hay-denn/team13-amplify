import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "https://b7tt4s7jl3.execute-api.us-east-1.amazonaws.com/dev1";
const ORGANIZATIONS_API_URL="https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

const CatalogAPI: React.FC = () => {
// States for /status & /catalog_count
const [status, setStatus] = useState<string | null>(null);
const [catalogCount, setCatalogCount] = useState<number | null>(null);

// States for Create Catalog (POST)
// Assuming CatalogID is auto-incremented, we only supply CatalogOrganization.
const [createOrganization, setCreateOrganization] = useState("");
const [createResult, setCreateResult] = useState<string | null>(null);

// States for Get Catalog (GET)
const [getID, setGetID] = useState("");
const [catalogData, setCatalogData] = useState<any>(null);
const [getError, setGetError] = useState<string | null>(null);

// States for Update Catalog (PUT)
const [updateID, setUpdateID] = useState("");
const [updateOrganization, setUpdateOrganization] = useState("");
const [updateResult, setUpdateResult] = useState<string | null>(null);

// States for Delete Catalog (DELETE)
const [deleteID, setDeleteID] = useState("");
const [deleteResult, setDeleteResult] = useState<string | null>(null);

// get valid organizations
const [organizations, setOrganizations] = useState<any>(null);

// Fetch Organizations
const fetchOrganizations = async () => {
	try {
		const res = await fetch(`${ORGANIZATIONS_API_URL}/organizations`);
		if (!res.ok) {
			throw new Error(`Organizations fetch failed: ${res.status}`);
		}
		const data = await res.json();
		
		// loop through the data and get the organization ids
		const orgs = data.map((org: any) => org.OrganizationID);
		setOrganizations(orgs);

	} catch (err: any) {
		setOrganizations(null);
	}
};

/**
 * Fetch API status (GET /status)
 * Expected response: { "status": "Running" }
 */
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

/**
 * Fetch catalog count (GET /catalog_count)
 * Expected response: { "count": <number> }
 */
const fetchCatalogCount = async () => {
try {
	const res = await fetch(`${API_BASE_URL}/catalog_count`);
	if (!res.ok) {
	throw new Error(`Catalog count fetch failed: ${res.status}`);
	}
	const data = await res.json();
	setCatalogCount(data.count);
} catch (err: any) {
	setCatalogCount(null);
}
};

/**
 * Create Catalog (POST /catalog)
 * Expects body: { "CatalogOrganization": "yourOrganizationId" }
 */
const handleCreateCatalog = async () => {
try {
	const response = await fetch(`${API_BASE_URL}/catalog`, {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
		CatalogOrganization: createOrganization,
	}),
	});

	if (!response.ok) {
	throw new Error(`Create failed: ${response.status}, ${await response.text()}`);
	}

	setCreateResult("Catalog created successfully!");
	setCreateOrganization("");
	// Optionally refresh the catalog count
	fetchCatalogCount();
} catch (error: any) {
	setCreateResult(`Error creating catalog: ${error.message}`);
}
};

/**
 * Get Catalog (GET /catalog?CatalogID=123)
 */
const handleGetCatalog = async () => {
try {
	const url = `${API_BASE_URL}/catalog?CatalogID=${encodeURIComponent(getID)}`;
	const response = await fetch(url, { method: "GET" });
	if (!response.ok) {
	throw new Error(`Get failed: ${response.status}, ${await response.text()}`);
	}
	const data = await response.json();
	setCatalogData(data);
	setGetError(null);
} catch (error: any) {
	setCatalogData(null);
	setGetError(`Error fetching catalog: ${error.message}`);
}
};

/**
 * Update Catalog (PUT /catalog)
 * Expects body: { "CatalogID": 123, "CatalogOrganization": "newOrganizationId" }
 */
const handleUpdateCatalog = async () => {
try {
	const requestBody: { [key: string]: any } = { CatalogID: updateID };

	if (updateOrganization.trim() !== "") {
	requestBody.CatalogOrganization = updateOrganization;
	}

	const response = await fetch(`${API_BASE_URL}/catalog`, {
	method: "PUT",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify(requestBody),
	});

	if (!response.ok) {
	throw new Error(`Update failed: ${response.status}, ${await response.text()}`);
	}

	setUpdateResult("Catalog updated successfully!");
	setUpdateID("");
	setUpdateOrganization("");
} catch (error: any) {
	setUpdateResult(`Error updating catalog: ${error.message}`);
}
};

/**
 * Delete Catalog (DELETE /catalog?CatalogID=123)
 */
const handleDeleteCatalog = async () => {
try {
	const url = `${API_BASE_URL}/catalog?CatalogID=${encodeURIComponent(deleteID)}`;
	const response = await fetch(url, {
	method: "DELETE",
	});

	if (!response.ok) {
	throw new Error(`Delete failed: ${response.status}, ${await response.text()}`);
	}

	setDeleteResult("Catalog deleted successfully!");
	setDeleteID("");
	// Optionally refresh the catalog count
	fetchCatalogCount();
} catch (error: any) {
	setDeleteResult(`Error deleting catalog: ${error.message}`);
}
};

// Fetch status & catalog count once on mount
useEffect(() => {
fetchStatus();
fetchCatalogCount();
fetchOrganizations();
}, []);

return (
<div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
	<div className="max-w-2xl w-full bg-white p-6 rounded shadow space-y-6">
	<h1 className="text-2xl font-bold text-center">Catalog API</h1>

	{/* SECTION: Status & Catalog Count */}
	<section>
		<div className="space-y-2">
		<p>
			<strong>Status:</strong>{" "}
			{status !== null ? status : "Loading..."}
		</p>
		<p>
			<strong>Catalog Count:</strong>{" "}
			{catalogCount !== null ? catalogCount : "Loading..."}
		</p>
		<button
			onClick={() => {
			fetchStatus();
			fetchCatalogCount();
			}}
			className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
		>
			Refresh
		</button>
		</div>
		<div>
		{/* Link to see all catalogs (if your API supports it) */}
		<Link to={`${API_BASE_URL}/catalogs`}>See All Catalogs</Link>
		</div>
	</section>

	{/* SECTION: Create Catalog */}
	<section>
		<div className="space-y-2">
		<select
			value={createOrganization}
			onChange={(e) => setCreateOrganization(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		>
			<option value="">Select Organization</option>
			{organizations &&
			organizations.map((org: any) => (
				<option key={org} value={org}>
				{org}
				</option>
			))}
		</select>
		<button
			onClick={handleCreateCatalog}
			className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
		>
			Create
		</button>
		{createResult && (
			<p className="text-sm text-green-600">{createResult}</p>
		)}
		</div>
	</section>

	{/* SECTION: Get Catalog */}
	<section>
		<div className="space-y-2">
		<input
			type="text"
			placeholder="Catalog ID"
			value={getID}
			onChange={(e) => setGetID(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<button
			onClick={handleGetCatalog}
			className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
		>
			Get Catalog
		</button>
		{catalogData && (
			<div className="bg-gray-100 p-3 rounded mt-2 text-left">
			<pre className="text-sm whitespace-pre-wrap">
				{JSON.stringify(catalogData, null, 2)}
			</pre>
			</div>
		)}
		{getError && <p className="text-sm text-red-600">{getError}</p>}
		</div>
	</section>

	{/* SECTION: Update Catalog */}
	<section>
		<div className="space-y-2">
		<input
			type="text"
			placeholder="Catalog ID"
			value={updateID}
			onChange={(e) => setUpdateID(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<select
			value={updateOrganization}
			onChange={(e) => setUpdateOrganization(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		>
			<option value="">Select Organization</option>
			{organizations &&
			organizations.map((org: any) => (
				<option key={org} value={org}>
				{org}
				</option>
			))}
		</select>
		<button
			onClick={handleUpdateCatalog}
			className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
		>
			Update
		</button>
		{updateResult && (
			<p className="text-sm text-green-600">{updateResult}</p>
		)}
		</div>
	</section>

	{/* SECTION: Delete Catalog */}
	<section>
		<div className="space-y-2">
		<input
			type="text"
			placeholder="Catalog ID to Delete"
			value={deleteID}
			onChange={(e) => setDeleteID(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<button
			onClick={handleDeleteCatalog}
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

export default CatalogAPI;
