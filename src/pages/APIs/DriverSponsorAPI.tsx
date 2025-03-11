import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "https://vnduk955ek.execute-api.us-east-1.amazonaws.com/dev1";
const ORGANIZATIONS_API_URL="https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

const DriverSponsorAPI: React.FC = () => {
// States for /status & /driverssponsors_count
const [status, setStatus] = useState<string | null>(null);
const [relationshipCount, setRelationshipCount] = useState<number | null>(null);

// States for Create Relationship (POST)
const [createEmail, setCreateEmail] = useState("");
const [createSponsorID, setCreateSponsorID] = useState("");
const [createResult, setCreateResult] = useState<string | null>(null);

// States for Get Relationship (GET)
const [getEmail, setGetEmail] = useState("");
const [getSponsorID, setGetSponsorID] = useState("");
const [relationshipData, setRelationshipData] = useState<any>(null);
const [getError, setGetError] = useState<string | null>(null);

// States for Delete Relationship (DELETE)
const [deleteEmail, setDeleteEmail] = useState("");
const [deleteSponsorID, setDeleteSponsorID] = useState("");
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
 * Fetch relationship count (GET /driverssponsors_count)
 * This example fetches the overall count without filtering.
 */
const fetchRelationshipCount = async () => {
try {
	const res = await fetch(`${API_BASE_URL}/driverssponsors_count`);
	if (!res.ok) {
	throw new Error(`Relationship count fetch failed: ${res.status}`);
	}
	const data = await res.json();
	// The API may return different key names if filtered; here we expect { count: <number> }
	setRelationshipCount(data.count || data.SponsorCount || data.DriverCount || 0);
} catch (err: any) {
	setRelationshipCount(null);
}
};

/**
 * Create Relationship (POST /driverssponsor)
 * Expects body: { DriversEmail, DriversSponsorID }
 */
const handleCreateRelationship = async () => {
try {
	const response = await fetch(`${API_BASE_URL}/driverssponsor`, {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
		DriversEmail: createEmail,
		DriversSponsorID: createSponsorID,
	}),
	});

	if (!response.ok) {
	throw new Error(`Create failed: ${response.status}, ${await response.text()}`);
	}

	setCreateResult("Relationship created successfully!");
	setCreateEmail("");
	setCreateSponsorID("");
	// Optionally refresh the relationship count
	fetchRelationshipCount();
} catch (error: any) {
	setCreateResult(`Error creating relationship: ${error.message}`);
}
};

/**
 * Get Relationship (GET /driverssponsor)
 * Expects query parameters: DriversEmail & DriversSponsorID
 */
const handleGetRelationship = async () => {
try {
	const url = `${API_BASE_URL}/driverssponsor?DriversEmail=${encodeURIComponent(getEmail)}&DriversSponsorID=${encodeURIComponent(getSponsorID)}`;
	const response = await fetch(url, { method: "GET" });
	if (!response.ok) {
	throw new Error(`Get failed: ${response.status}, ${await response.text()}`);
	}
	const data = await response.json();
	setRelationshipData(data);
	setGetError(null);
} catch (error: any) {
	setRelationshipData(null);
	setGetError(`Error fetching relationship: ${error.message}`);
}
};

/**
 * Delete Relationship (DELETE /driverssponsor)
 * Expects query parameters: DriversEmail & DriversSponsorID
 */
const handleDeleteRelationship = async () => {
try {
	const url = `${API_BASE_URL}/driverssponsor?DriversEmail=${encodeURIComponent(deleteEmail)}&DriversSponsorID=${encodeURIComponent(deleteSponsorID)}`;
	const response = await fetch(url, { method: "DELETE" });
	if (!response.ok) {
	throw new Error(`Delete failed: ${response.status}, ${await response.text()}`);
	}
	setDeleteResult("Relationship deleted successfully!");
	setDeleteEmail("");
	setDeleteSponsorID("");
	// Optionally refresh the relationship count
	fetchRelationshipCount();
} catch (error: any) {
	setDeleteResult(`Error deleting relationship: ${error.message}`);
}
};

// Fetch status & relationship count once on mount
useEffect(() => {
fetchStatus();
fetchRelationshipCount();
fetchOrganizations();
}, []);

return (
<div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
	<div className="max-w-2xl w-full bg-white p-6 rounded shadow space-y-6">
	<h1 className="text-2xl font-bold text-center">Driver–Sponsor API</h1>

	{/* SECTION: Status & Relationship Count */}
	<section>
		<div className="space-y-2">
		<p>
			<strong>Status:</strong>{" "}
			{status !== null ? status : "Loading..."}
		</p>
		<p>
			<strong>Relationship Count:</strong>{" "}
			{relationshipCount !== null ? relationshipCount : "Loading..."}
		</p>
		<button
			onClick={() => {
			fetchStatus();
			fetchRelationshipCount();
			}}
			className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
		>
			Refresh
		</button>
		</div>
		<div>
		{/* Link to see all relationships */}
		<Link to={`${API_BASE_URL}/driverssponsors`}>See All Relationships</Link>
		</div>
	</section>

	{/* SECTION: Create Relationship */}
	<section>
		<div className="space-y-2">
		<input
			type="email"
			placeholder="Driver's Email"
			value={createEmail}
			onChange={(e) => setCreateEmail(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<select
			value={createSponsorID}
			onChange={(e) => setCreateSponsorID(e.target.value)}
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
			onClick={handleCreateRelationship}
			className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
		>
			Create
		</button>
		{createResult && (
			<p className="text-sm text-green-600">{createResult}</p>
		)}
		</div>
	</section>

	{/* SECTION: Get Relationship */}
	<section>
		<div className="space-y-2">
		<input
			type="email"
			placeholder="Driver's Email"
			value={getEmail}
			onChange={(e) => setGetEmail(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<select
			value={getSponsorID}
			onChange={(e) => setGetSponsorID(e.target.value)}
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
			onClick={handleGetRelationship}
			className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
		>
			Get Relationship
		</button>
		{relationshipData && (
			<div className="bg-gray-100 p-3 rounded mt-2 text-left">
			<pre className="text-sm whitespace-pre-wrap">
				{JSON.stringify(relationshipData, null, 2)}
			</pre>
			</div>
		)}
		{getError && <p className="text-sm text-red-600">{getError}</p>}
		</div>
	</section>

	{/* SECTION: Delete Relationship */}
	<section>
		<div className="space-y-2">
		<input
			type="email"
			placeholder="Driver's Email"
			value={deleteEmail}
			onChange={(e) => setDeleteEmail(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<select
			value={deleteSponsorID}
			onChange={(e) => setDeleteSponsorID(e.target.value)}
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
			onClick={handleDeleteRelationship}
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

export default DriverSponsorAPI;
