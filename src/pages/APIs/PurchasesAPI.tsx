import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "https://mk7fc3pb53.execute-api.us-east-1.amazonaws.com/dev1";
const ORGANIZATIONS_API_URL="https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

const PurchasesAPI: React.FC = () => {
// -- States for /status & /purchase_count
const [status, setStatus] = useState<string | null>(null);
const [purchaseCount, setPurchaseCount] = useState<number | null>(null);

// -- States for Create Purchase (POST)
const [createDriver, setCreateDriver] = useState("");
const [createStatus, setCreateStatus] = useState("");
const [createDate, setCreateDate] = useState("");
const [createSponsorID, setCreateSponsorID] = useState("");
const [createResult, setCreateResult] = useState<string | null>(null);

// -- States for Get Purchase (GET)
const [getID, setGetID] = useState("");
const [purchaseData, setPurchaseData] = useState<any>(null);
const [getError, setGetError] = useState<string | null>(null);

// -- States for Update Purchase (PUT)
const [updateID, setUpdateID] = useState("");
const [updateDriver, setUpdateDriver] = useState("");
const [updateStatusValue, setUpdateStatusValue] = useState("");
const [updateDate, setUpdateDate] = useState("");
const [updateSponsorID, setUpdateSponsorID] = useState("");
const [updateResult, setUpdateResult] = useState<string | null>(null);

// -- States for Delete Purchase (DELETE)
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
 * Example response: { "status": "OK" }
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
 * Fetch purchase count (GET /purchase_count)
 * Example response: { "count": 42 }
 */
const fetchPurchaseCount = async () => {
try {
	const res = await fetch(`${API_BASE_URL}/purchase_count`);
	if (!res.ok) {
	throw new Error(`Purchase count fetch failed: ${res.status}`);
	}
	const data = await res.json();
	setPurchaseCount(data.count);
} catch (err: any) {
	setPurchaseCount(null);
}
};

/**
 * Create Purchase (POST /purchase)
 * PurchaseID is auto-incremented, so exclude it from the POST body.
 * Example body:
 * {
 *   "PurchaseDriver": "driver@example.com",
 *   "PurchaseStatus": "active",
 *   "PurchaseDate": "2025-03-03"
 * }
 */
const handleCreatePurchase = async () => {
try {
	const response = await fetch(`${API_BASE_URL}/purchase`, {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
		PurchaseDriver: createDriver,
		PurchaseStatus: createStatus,
		PurchaseDate: createDate,
		PurchaseSponsorID: createSponsorID
	}),
	});

	if (!response.ok) {
	throw new Error(`Create failed: ${response.status}, ${await response.text()}`);
	}

	setCreateResult("Purchase created successfully!");
	// Clear inputs
	setCreateDriver("");
	setCreateStatus("");
	setCreateDate("");
	setCreateSponsorID("");

	// Optionally refresh purchaseCount
	fetchPurchaseCount();
} catch (error: any) {
	setCreateResult(`Error creating purchase: ${error.message}`);
}
};

/**
 * Get Purchase (GET /purchase)
 * Example usage: GET /purchase?PurchaseID=123
 */
const handleGetPurchase = async () => {
try {
	const url = `${API_BASE_URL}/purchase?PurchaseID=${encodeURIComponent(getID)}`;
	const response = await fetch(url, { method: "GET" });
	if (!response.ok) {
	throw new Error(`Get failed: ${response.status}, ${await response.text()}`);
	}
	const data = await response.json();
	setPurchaseData(data);
	setGetError(null);
} catch (error: any) {
	setPurchaseData(null);
	setGetError(`Error fetching purchase: ${error.message}`);
}
};

/**
 * Update Purchase (PUT /purchase)
 * Example body:
 * {
 *   "PurchaseID": 123,
 *   "PurchaseDriver": "driver@example.com",
 *   "PurchaseStatus": "inactive",
 *   "PurchaseDate": "2025-03-04"
 * }
 */
const handleUpdatePurchase = async () => {
try {
	// Construct the body dynamically, including only non-empty values
	const requestBody: { [key: string]: any } = { PurchaseID: updateID };

	if (updateDriver.trim() !== "") {
	requestBody.PurchaseDriver = updateDriver;
	}
	if (updateStatusValue.trim() !== "") {
	requestBody.PurchaseStatus = updateStatusValue;
	}
	if (updateDate.trim() !== "") {
	requestBody.PurchaseDate = updateDate;
	}
	if (updateSponsorID.trim() !== "") {
	requestBody.PurchaseSponsorID = updateSponsorID;
	}

	const response = await fetch(`${API_BASE_URL}/purchase`, {
	method: "PUT",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify(requestBody),
	});

	if (!response.ok) {
	throw new Error(`Update failed: ${response.status}, ${await response.text()}`);
	}

	setUpdateResult("Purchase updated successfully!");
	setUpdateID("");
	setUpdateDriver("");
	setUpdateStatusValue("");
	setUpdateDate("");
	setUpdateSponsorID("");
} catch (error: any) {
	setUpdateResult(`Error updating purchase: ${error.message}`);
}
};

/**
 * Delete Purchase (DELETE /purchase)
 * Typically, you can send PurchaseID in query params or body.
 * Example usage: DELETE /purchase?PurchaseID=123
 */
const handleDeletePurchase = async () => {
try {
	const url = `${API_BASE_URL}/purchase?PurchaseID=${encodeURIComponent(deleteID)}`;

	// Make the DELETE request with no request body
	const response = await fetch(url, {
	method: "DELETE",
	});

	if (!response.ok) {
	throw new Error(`Delete failed: ${response.status}, ${await response.text()}`);
	}

	setDeleteResult("Purchase deleted successfully!");
	setDeleteID("");

	// Optionally refresh purchaseCount
	fetchPurchaseCount();
} catch (error: any) {
	setDeleteResult(`Error deleting purchase: ${error.message}`);
}
};

// Fetch status & purchaseCount once on mount
useEffect(() => {
fetchStatus();
fetchPurchaseCount();
fetchOrganizations();
}, []);

return (
<div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
	<div className="max-w-2xl w-full bg-white p-6 rounded shadow space-y-6">
	<h1 className="text-2xl font-bold text-center">Purchases API</h1>

	{/* SECTION: Status & Purchase Count */}
	<section>
		<div className="space-y-2">
		<p>
			<strong>Status:</strong>{" "}
			{status !== null ? status : "Loading..."}
		</p>
		<p>
			<strong>Purchase Count:</strong>{" "}
			{purchaseCount !== null ? purchaseCount : "Loading..."}
		</p>
		<button
			onClick={() => {
			fetchStatus();
			fetchPurchaseCount();
			}}
			className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
		>
			Refresh
		</button>
		</div>
		<div>
		{/* Link to see all purchases (if your API supports it) */}
		<Link to={`${API_BASE_URL}/purchases`}>See All Purchases</Link>
		</div>
	</section>

	{/* SECTION: Create Purchase */}
	<section>
		<div className="space-y-2">
		<input
			type="text"
			placeholder="Purchase Driver"
			value={createDriver}
			onChange={(e) => setCreateDriver(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<input
			type="text"
			placeholder="Purchase Status"
			value={createStatus}
			onChange={(e) => setCreateStatus(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<input
			type="date"
			placeholder="Purchase Date"
			value={createDate}
			onChange={(e) => setCreateDate(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<select
            value={createSponsorID}
            onChange={(e) => setCreateSponsorID(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
        >
            <option value="">Select Organization</option>
            {organizations && organizations.map((org: any) => (
            <option key={org} value={org}>
                {org}
            </option>
            ))}
        </select>
		<button
			onClick={handleCreatePurchase}
			className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
		>
			Create
		</button>
		{createResult && (
			<p className="text-sm text-green-600">{createResult}</p>
		)}
		</div>
	</section>

	{/* SECTION: Get Purchase */}
	<section>
		<div className="space-y-2">
		<input
			type="text"
			placeholder="Purchase ID"
			value={getID}
			onChange={(e) => setGetID(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<button
			onClick={handleGetPurchase}
			className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
		>
			Get Purchase
		</button>
		{purchaseData && (
			<div className="bg-gray-100 p-3 rounded mt-2 text-left">
			<pre className="text-sm whitespace-pre-wrap">
				{JSON.stringify(purchaseData, null, 2)}
			</pre>
			</div>
		)}
		{getError && <p className="text-sm text-red-600">{getError}</p>}
		</div>
	</section>

	{/* SECTION: Update Purchase */}
	<section>
		<div className="space-y-2">
		<input
			type="text"
			placeholder="Purchase ID"
			value={updateID}
			onChange={(e) => setUpdateID(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<input
			type="text"
			placeholder="New Driver"
			value={updateDriver}
			onChange={(e) => setUpdateDriver(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<input
			type="text"
			placeholder="New Status"
			value={updateStatusValue}
			onChange={(e) => setUpdateStatusValue(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<input
			type="date"
			placeholder="New Purchase Date"
			value={updateDate}
			onChange={(e) => setUpdateDate(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<select
            value={updateSponsorID}
            onChange={(e) => setUpdateSponsorID(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded"
        >
            <option value="">Select Organization</option>
            {organizations && organizations.map((org: any) => (
            <option key={org} value={org}>
                {org}
            </option>
            ))}
        </select>
		<button
			onClick={handleUpdatePurchase}
			className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
		>
			Update
		</button>
		{updateResult && (
			<p className="text-sm text-green-600">{updateResult}</p>
		)}
		</div>
	</section>

	{/* SECTION: Delete Purchase */}
	<section>
		<div className="space-y-2">
		<input
			type="text"
			placeholder="Purchase ID to Delete"
			value={deleteID}
			onChange={(e) => setDeleteID(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<button
			onClick={handleDeletePurchase}
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

export default PurchasesAPI;
