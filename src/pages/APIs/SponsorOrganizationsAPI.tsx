import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

const SponsorOrganizationsAPI: React.FC = () => {
// -- States for /status & /organization_count
const [status, setStatus] = useState<string | null>(null);
const [organizationCount, setOrganizationCount] = useState<number | null>(null);

// -- States for Create Organization (POST)
const [createName, setCreateName] = useState("");
const [createResult, setCreateResult] = useState<string | null>(null);

// -- States for Get Organization (GET)
const [getID, setGetID] = useState("");
const [organizationData, setOrganizationData] = useState<any>(null);
const [getError, setGetError] = useState<string | null>(null);

// -- States for Update Organization (PUT)
const [updateID, setUpdateID] = useState("");
const [updateName, setUpdateName] = useState("");
const [updateResult, setUpdateResult] = useState<string | null>(null);

// -- States for Delete Organization (DELETE)
const [deleteID, setDeleteID] = useState("");
const [deleteResult, setDeleteResult] = useState<string | null>(null);

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
 * Fetch organization count (GET /organization_count)
 * Example response: { "count": 42 }
 */
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

/**
 * Create Organization (POST /organization)
 * Example body:
 * {
 *   "OrganizationID": "12345",
 *   "OrganizationName": "My Org"
 * }
 */
const handleCreateOrganization = async () => {
try {
	const response = await fetch(`${API_BASE_URL}/organization`, {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
		OrganizationName: createName,
	}),
	});

	if (!response.ok) {
	throw new Error(`Create failed: ${response.status}`);
	}

	setCreateResult("Organization created successfully!");
	// Clear inputs
	setCreateName("");

	// Optionally refresh organizationCount
	fetchOrganizationCount();
} catch (error: any) {
	setCreateResult(`Error creating organization: ${error.message}`);
}
};

/**
 * Get Organization (GET /organization)
 * Example usage: GET /organization?OrganizationID=12345
 */
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

/**
 * Update Organization (PUT /organization)
 * Example body:
 * {
 *   "OrganizationID": "12345",
 *   "OrganizationName": "New Org Name"
 * }
 */
const handleUpdateOrganization = async () => {
try {
	// Construct the body dynamically, including only non-empty values
	const requestBody: { [key: string]: any } = { OrganizationID: updateID };

	if (updateName.trim() !== "") {
	requestBody.OrganizationName = updateName;
	}

	const response = await fetch(`${API_BASE_URL}/organization`, {
	method: "PUT",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify(requestBody),
	});

	if (!response.ok) {
	throw new Error(`Update failed: ${response.status}, ${await response.text()}`);
	}

	setUpdateResult("Organization updated successfully!");
	setUpdateID("");
	setUpdateName("");
} catch (error: any) {
	setUpdateResult(`Error updating organization: ${error.message}`);
}
};

/**
 * Delete Organization (DELETE /organization)
 * Typically, you can send the OrganizationID in query params or body. 
 * Example usage: /organization?OrganizationID=12345
 */
const handleDeleteOrganization = async () => {
try {
	const url = `${API_BASE_URL}/organization?OrganizationID=${encodeURIComponent(deleteID)}`;

	// Make the DELETE request with no request body
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

// Fetch status & organizationCount once on mount
useEffect(() => {
fetchStatus();
fetchOrganizationCount();
}, []);

return (
<div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
	<div className="max-w-2xl w-full bg-white p-6 rounded shadow space-y-6">
	<h1 className="text-2xl font-bold text-center">Sponsor Organizations API</h1>

	{/* SECTION: Status & Organization Count */}
	<section>
		<div className="space-y-2">
		<p>
			<strong>Status:</strong>{" "}
			{status !== null ? status : "Loading..."}
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
		<Link to="https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1/organizations">
			See All Organizations
		</Link>
		</div>
	</section>

	{/* SECTION: Create Organization */}
	<section>
		<div className="space-y-2">
		<input
			type="text"
			placeholder="Organization Name"
			value={createName}
			onChange={(e) => setCreateName(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<button
			onClick={handleCreateOrganization}
			className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
		>
			Create
		</button>
		{createResult && <p className="text-sm text-green-600">{createResult}</p>}
		</div>
	</section>

	{/* SECTION: Get Organization */}
	<section>
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
			Get Organization
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
		<button
			onClick={handleUpdateOrganization}
			className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
		>
			Update
		</button>
		{updateResult && <p className="text-sm text-green-600">{updateResult}</p>}
		</div>
	</section>

	{/* SECTION: Delete Organization */}
	<section>
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
		{deleteResult && <p className="text-sm text-green-600">{deleteResult}</p>}
		</div>
	</section>
	</div>
</div>
);
};

export default SponsorOrganizationsAPI;
