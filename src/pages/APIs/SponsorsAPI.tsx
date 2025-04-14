import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_SPONSOR_URL = import.meta.env.VITE_API_SPONSOR;
const API_ORGANIZATION_URL= import.meta.env.VITE_API_ORGANIZATION;

const SponsorsAPI: React.FC = () => {
// -- States for /status & /sponsor_count
const [status, setStatus] = useState<string | null>(null);
const [sponsorCount, setSponsorCount] = useState<number | null>(null);

// -- States for Create Sponsor (POST)
const [createEmail, setCreateEmail] = useState("");
const [createFName, setCreateFName] = useState("");
const [createLName, setCreateLName] = useState("");
const [createOrganization, setCreateOrganization] = useState("");
const [createResult, setCreateResult] = useState<string | null>(null);

// -- States for Get Sponsor (GET)
const [getEmail, setGetEmail] = useState("");
const [sponsorData, setSponsorData] = useState<any>(null);
const [getError, setGetError] = useState<string | null>(null);

// -- States for Update Sponsor (PUT)
const [updateEmail, setUpdateEmail] = useState("");
const [updateFName, setUpdateFName] = useState("");
const [updateLName, setUpdateLName] = useState("");
const [updateOrganization, setUpdateOrganization] = useState("");
const [updateResult, setUpdateResult] = useState<string | null>(null);

// -- States for Delete Sponsor (DELETE)
const [deleteEmail, setDeleteEmail] = useState("");
const [deleteResult, setDeleteResult] = useState<string | null>(null);

// get valid organizations
const [organizations, setOrganizations] = useState<any>(null);

// Fetch Organizations
const fetchOrganizations = async () => {
	try {
		const res = await fetch(`${API_ORGANIZATION_URL}/organizations`);
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
	const res = await fetch(`${API_SPONSOR_URL}/status`);
	if (!res.ok) {
	throw new Error(`Status fetch failed: ${res.status}`);
	}
	const data = await res.json();
	// Adjust if your API returns a different structure
	setStatus(JSON.stringify(data));
} catch (err: any) {
	setStatus(`Error: ${err.message}`);
}
};

/**
 * Fetch sponsor count (GET /sponsor_count)
 * Example response: { "count": 42 }
 */
const fetchSponsorCount = async () => {
try {
	const res = await fetch(`${API_SPONSOR_URL}/sponsor_count`);
	if (!res.ok) {
	throw new Error(`Sponsor count fetch failed: ${res.status}`);
	}
	const data = await res.json();
	setSponsorCount(data.count);
} catch (err: any) {
	setSponsorCount(null);
}
};

/**
   * Create Sponsor (POST /sponsor)
   * Example body:
   * {
   *   "SponsorEmail": "jsmiz@gmail.com",
   *   "SponsorFName": "John",
   *   "SponsorLName": "Smith"
   * }
   */
const handleCreateSponsor = async () => {
try {
	const response = await fetch(`${API_SPONSOR_URL}/sponsor`, {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
		UserEmail: createEmail,
		UserFName: createFName,
		UserLName: createLName,
		UserOrganization: createOrganization,
	}),
	});
	if (!response.ok) {
	throw new Error(`Create failed: ${response.status}`);
	}
	setCreateResult("Sponsor created successfully!");
	// Clear inputs
	setCreateEmail("");
	setCreateFName("");
	setCreateLName("");
	setCreateOrganization("");

	// Optionally refresh sponsorCount
	fetchSponsorCount();
} catch (error: any) {
	setCreateResult(`Error creating sponsor: ${error.message}`);
}
};

/**
 * Get Sponsor (GET /sponsor)
 */
const handleGetSponsor = async () => {
try {
	const url = `${API_SPONSOR_URL}/sponsor?UserEmail=${encodeURIComponent(getEmail)}`;
	const response = await fetch(url, { method: "GET" });
	if (!response.ok) {
	throw new Error(`Get failed: ${response.status}`);
	}
	const data = await response.json();
	setSponsorData(data);
	setGetError(null);
} catch (error: any) {
	setSponsorData(null);
	setGetError(`Error fetching sponsor: ${error.message}`);
}
};

/**
 * Update Sponsor (PUT /sponsor)
 * Example body:
 * {
 *   "SponsorEmail": "jsmiz@gmail.com",
 *   "SponsorFName": "Joseph",
 *   "SponsorLName": "Smith"
 * }
 */
const handleUpdateSponsor = async () => {
try {
	if (!updateEmail) {
	throw new Error("Email is required to update sponsor.");
	}

	// Dynamically build request body with only provided values
	const requestBody: Record<string, string> = { UserEmail: updateEmail };

	if (updateFName) requestBody.UserFName = updateFName;
	if (updateLName) requestBody.UserLName = updateLName;
	if (updateOrganization) requestBody.UserOrganization = updateOrganization;

	const response = await fetch(`${API_SPONSOR_URL}/sponsor`, {
	method: "PUT",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify(requestBody),
	});

	if (!response.ok) {
	throw new Error(`Update failed: ${response.status}`);
	}

	setUpdateResult("Sponsor updated successfully!");
	setUpdateEmail(""); // Reset fields after successful update
	setUpdateFName("");
	setUpdateLName("");
	setUpdateOrganization("");

} catch (error: any) {
	setUpdateResult(`Error updating sponsor: ${error.message}`);
}
};


/**
 * Delete Sponsor (DELETE /sponsor)
 * Example body:
 * {
 *   "UserEmail": "jsmiz@gmail.com"
 * }
 */
const handleDeleteSponsor = async () => {
	try {
		if (!deleteEmail) {
			throw new Error("Email is required to delete a sponsor.");
		}

		const response = await fetch(`${API_SPONSOR_URL}/sponsor?UserEmail=${encodeURIComponent(deleteEmail)}`, {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
		});

		if (!response.ok) {
			throw new Error(`Delete failed: ${response.status}`);
		}

		setDeleteResult("Sponsor deleted successfully!");
		setDeleteEmail("");

		// Optionally refresh sponsor count
		fetchSponsorCount();

	} catch (error: any) {
		setDeleteResult(`Error deleting sponsor: ${error.message}`);
	}
};
	

// Fetch status & sponsorCount once on mount
useEffect(() => {
fetchStatus();
fetchSponsorCount();
fetchOrganizations();
}, []);

return (
<div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
	<div className="max-w-2xl w-full bg-white p-6 rounded shadow space-y-6">
	<h1 className="text-2xl font-bold text-center">Sponsors API</h1>

	{/* SECTION: Status & Sponsor Count */}
	<section>
		<div className="space-y-2">
		<p>
			<strong>Status:</strong>{" "}
			{status !== null ? status : "Loading..."}
		</p>
		<p>
			<strong>Sponsor Count:</strong>{" "}
			{sponsorCount !== null ? sponsorCount : "Loading..."}
		</p>
		<button
			onClick={() => {
			fetchStatus();
			fetchSponsorCount();
			}}
			className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
		>
			Refresh
		</button>
		</div>
		<div>
		<Link to={`${API_SPONSOR_URL}/sponsors`}>See All Sponsors</Link>
		</div>
	</section>

	{/* SECTION: Create Sponsor */}
	<section>
		<div className="space-y-2">
		<input
			type="email"
			placeholder="Sponsor Email"
			value={createEmail}
			onChange={(e) => setCreateEmail(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<input
			type="text"
			placeholder="First Name"
			value={createFName}
			onChange={(e) => setCreateFName(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<input
			type="text"
			placeholder="Last Name"
			value={createLName}
			onChange={(e) => setCreateLName(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<select
			value={createOrganization}
			onChange={(e) => setCreateOrganization(e.target.value)}
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
			onClick={handleCreateSponsor}
			className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
		>
			Create
		</button>
		{createResult && <p className="text-sm text-green-600">{createResult}</p>}
		</div>
	</section>

	{/* SECTION: Get Sponsor */}
	<section>
		<div className="space-y-2">
		<input
			type="email"
			placeholder="Sponsor Email"
			value={getEmail}
			onChange={(e) => setGetEmail(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<button
			onClick={handleGetSponsor}
			className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
		>
			Get Sponsor
		</button>
		{sponsorData && (
			<div className="bg-gray-100 p-3 rounded mt-2 text-left">
			<pre className="text-sm whitespace-pre-wrap">
				{JSON.stringify(sponsorData, null, 2)}
			</pre>
			</div>
		)}
		{getError && <p className="text-sm text-red-600">{getError}</p>}
		</div>
	</section>

	{/* SECTION: Update Sponsor */}
	<section>
		<div className="space-y-2">
		<input
			type="email"
			placeholder="Sponsor Email"
			value={updateEmail}
			onChange={(e) => setUpdateEmail(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<input
			type="text"
			placeholder="New First Name"
			value={updateFName}
			onChange={(e) => setUpdateFName(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<input
			type="text"
			placeholder="New Last Name"
			value={updateLName}
			onChange={(e) => setUpdateLName(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<select
			value={updateOrganization}
			onChange={(e) => setUpdateOrganization(e.target.value)}
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
			onClick={handleUpdateSponsor}
			className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
		>
			Update
		</button>
		{updateResult && <p className="text-sm text-green-600">{updateResult}</p>}
		</div>
	</section>

	{/* SECTION: Delete Sponsor */}
	<section>
		<div className="space-y-2">
		<input
			type="email"
			placeholder="User Email to Delete"
			value={deleteEmail}
			onChange={(e) => setDeleteEmail(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<button
			onClick={handleDeleteSponsor}
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

export default SponsorsAPI;
