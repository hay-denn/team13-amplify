import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1";

const DriversAPI: React.FC = () => {
// -- States for /status & /driver_count
const [status, setStatus] = useState<string | null>(null);
const [driverCount, setDriverCount] = useState<number | null>(null);

// -- States for Create Driver (POST)
const [createEmail, setCreateEmail] = useState("");
const [createFName, setCreateFName] = useState("");
const [createLName, setCreateLName] = useState("");
const [createResult, setCreateResult] = useState<string | null>(null);

// -- States for Get Driver (GET)
const [getEmail, setGetEmail] = useState("");
const [driverData, setDriverData] = useState<any>(null);
const [getError, setGetError] = useState<string | null>(null);

// -- States for Update Driver (PUT)
const [updateEmail, setUpdateEmail] = useState("");
const [updateFName, setUpdateFName] = useState("");
const [updateLName, setUpdateLName] = useState("");
const [updateResult, setUpdateResult] = useState<string | null>(null);

// -- States for Delete Driver (DELETE)
const [deleteEmail, setDeleteEmail] = useState("");
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
	// Adjust if your API returns a different structure
	setStatus(JSON.stringify(data));
} catch (err: any) {
	setStatus(`Error: ${err.message}`);
}
};

/**
 * Fetch driver count (GET /driver_count)
 * Example response: { "count": 42 }
 */
const fetchDriverCount = async () => {
try {
	const res = await fetch(`${API_BASE_URL}/driver_count`);
	if (!res.ok) {
	throw new Error(`Driver count fetch failed: ${res.status}`);
	}
	const data = await res.json();
	setDriverCount(data.count);
} catch (err: any) {
	setDriverCount(null);
}
};

/**
 * Create Driver (POST /driver)
 * Example body:
 * {
 *   "DriverEmail": "jsmiz@gmail.com",
 *   "DriverFName": "John",
 *   "DriverLName": "Smith"
 * }
 */

const handleCreateDriver = async () => {
try {
	const response = await fetch(`${API_BASE_URL}/driver`, {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
		DriverEmail: createEmail,
		DriverFName: createFName,
		DriverLName: createLName,
	}),
	});
	if (!response.ok) {
	throw new Error(`Create failed: ${response.status}`);
	}
	setCreateResult("Driver created successfully!");
	// Clear inputs
	setCreateEmail("");
	setCreateFName("");
	setCreateLName("");

	// Optionally refresh driverCount
	fetchDriverCount();
} catch (error: any) {
	setCreateResult(`Error creating driver: ${error.message}`);
}
};

/**
 * Get Driver (GET /driver)
 */
const handleGetDriver = async () => {
try {
	const url = `${API_BASE_URL}/driver?DriverEmail=${encodeURIComponent(getEmail)}`;
	const response = await fetch(url, { method: "GET" });
	if (!response.ok) {
	throw new Error(`Get failed: ${response.status}`);
	}
	const data = await response.json();
	setDriverData(data);
	setGetError(null);
} catch (error: any) {
	setDriverData(null);
	setGetError(`Error fetching driver: ${error.message}`);
}
};

/**
 * Update Driver (PUT /driver)
 * Example body:
 * {
 *   "DriverEmail": "jsmiz@gmail.com",
 *   "DriverFName": "Joseph",
 *   "DriverLName": "Smith"
 * }
 */
const handleUpdateDriver = async () => {
try {
	// Construct the body dynamically, including only non-empty values
	const requestBody: { [key: string]: any } = { DriverEmail: updateEmail };

	if (updateFName.trim() !== "") requestBody.DriverFName = updateFName;
	if (updateLName.trim() !== "") requestBody.DriverLName = updateLName;

	const response = await fetch(`${API_BASE_URL}/driver`, {
	method: "PUT",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify(requestBody),
	});

	if (!response.ok) {
	throw new Error(`Update failed: ${response.status}`);
	}

	setUpdateResult("Driver updated successfully!");
	setUpdateEmail("");
	setUpdateFName("");
	setUpdateLName("");

} catch (error: any) {
	setUpdateResult(`Error updating driver: ${error.message}`);
}
};


/**
 * Delete Driver (DELETE /driver)
 * Example body:
 * {
 *   "UserEmail": "jsmiz@gmail.com"
 * }
 */
const handleDeleteDriver = async () => {
try {
	// Construct the URL with the UserEmail as a query parameter
	const url = `${API_BASE_URL}/driver?DriverEmail=${encodeURIComponent(deleteEmail)}`;

	// Make the DELETE request with no request body
	const response = await fetch(url, {
	method: "DELETE",
	});

	if (!response.ok) {
	throw new Error(`Delete failed: ${response.status}`);
	}

	setDeleteResult("Driver deleted successfully!");
	setDeleteEmail("");

	// Optionally refresh driverCount
	fetchDriverCount();
} catch (error: any) {
	setDeleteResult(`Error deleting driver: ${error.message}`);
}
};


// Fetch status & driverCount once on mount
useEffect(() => {
fetchStatus();
fetchDriverCount();
}, []);

return (
<div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
	<div className="max-w-2xl w-full bg-white p-6 rounded shadow space-y-6">
	<h1 className="text-2xl font-bold text-center">Drivers API</h1>

	{/* SECTION: Status & Driver Count */}
	<section>
		<div className="space-y-2">
		<p>
			<strong>Status:</strong>{" "}
			{status !== null ? status : "Loading..."}
		</p>
		<p>
			<strong>Driver Count:</strong>{" "}
			{driverCount !== null ? driverCount : "Loading..."}
		</p>
		<button
			onClick={() => {
			fetchStatus();
			fetchDriverCount();
			}}
			className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
		>
			Refresh
		</button>
		</div>
		<div>
		<Link to="https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1/drivers">See All Drivers</Link>
		</div>
	</section>

	{/* SECTION: Create Driver */}
	<section>
		<div className="space-y-2">
		<input
			type="email"
			placeholder="Driver Email"
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
		<button
			onClick={handleCreateDriver}
			className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
		>
			Create
		</button>
		{createResult && <p className="text-sm text-green-600">{createResult}</p>}
		</div>
	</section>

	{/* SECTION: Get Driver */}
	<section>
		<div className="space-y-2">
		<input
			type="email"
			placeholder="Driver Email"
			value={getEmail}
			onChange={(e) => setGetEmail(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<button
			onClick={handleGetDriver}
			className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
		>
			Get Driver
		</button>
		{driverData && (
			<div className="bg-gray-100 p-3 rounded mt-2 text-left">
			<pre className="text-sm whitespace-pre-wrap">
				{JSON.stringify(driverData, null, 2)}
			</pre>
			</div>
		)}
		{getError && <p className="text-sm text-red-600">{getError}</p>}
		</div>
	</section>

	{/* SECTION: Update Driver */}
	<section>
		<div className="space-y-2">
		<input
			type="email"
			placeholder="Driver Email"
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
		<button
			onClick={handleUpdateDriver}
			className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
		>
			Update
		</button>
		{updateResult && <p className="text-sm text-green-600">{updateResult}</p>}
		</div>
	</section>

	{/* SECTION: Delete Driver */}
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
			onClick={handleDeleteDriver}
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

export default DriversAPI;
