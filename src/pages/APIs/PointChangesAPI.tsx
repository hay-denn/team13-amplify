import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Adjust to your actual backend base URL
const API_POINTCHANGES_URL = import.meta.env.VITE_API_POINTCHANGES;

const validPointChangeActions = ["Add", "Subtract", "Set"];

const PointChangesAPI: React.FC = () => {
// -- States for /status & /pointchange_count
const [status, setStatus] = useState<string | null>(null);
const [pointChangeCount, setPointChangeCount] = useState<number | null>(null);

// -- States for Create Point Change (POST)
const [createDriver, setCreateDriver] = useState("");
const [createSponsor, setCreateSponsor] = useState("");
const [createNumber, setCreateNumber] = useState("");
const [createAction, setCreateAction] = useState("");
const [createDate, setCreateDate] = useState("");
const [createResult, setCreateResult] = useState<string | null>(null);

// -- States for Get Single Point Change (GET)
const [getID, setGetID] = useState("");
const [pointChangeData, setPointChangeData] = useState<any>(null);
const [getError, setGetError] = useState<string | null>(null);

// -- States for Delete Point Change (DELETE)
const [deleteID, setDeleteID] = useState("");
const [deleteResult, setDeleteResult] = useState<string | null>(null);

/**
 * Fetch API status (GET /status)
 * Example response: { "status": "OK" }
 */
const fetchStatus = async () => {
try {
	const res = await fetch(`${API_POINTCHANGES_URL}/status`);
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
 * Fetch point change count (GET /pointchange_count)
 * Example response: { "count": 42 }
 */
const fetchPointChangeCount = async () => {
try {
	const res = await fetch(`${API_POINTCHANGES_URL}/pointchanges_count`);
	if (!res.ok) {
	throw new Error(`Count fetch failed: ${res.status}`);
	}
	const data = await res.json();
	setPointChangeCount(data.count);
} catch (err: any) {
	setPointChangeCount(null);
}
};

/**
 * Create Point Change (POST /pointchanges)
 * PointChangeID is auto-incremented, so exclude it from the POST body.
 * Example body:
 * {
 *   "PointChangeDriver": "driver@example.com",
 *   "PointChangeSponsor": "sponsor@example.com",
 *   "PointChangeNumber": "10.00",
 *   "PointChangeAction": "Awarded for ...",
 *   "PointChangeDate": "2025-03-03"
 * }
 */
const handleCreatePointChange = async () => {
try {
	const response = await fetch(`${API_POINTCHANGES_URL}/pointchange`, {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
		PointChangeDriver: createDriver,
		PointChangeSponsor: createSponsor,
		PointChangeNumber: createNumber,
		PointChangeAction: createAction,
		PointChangeDate: createDate,
	}),
	});

	if (!response.ok) {
	throw new Error(`Create failed: ${response.status}, ${await response.text()}`);
	}

	setCreateResult("Point change created successfully!");
	setCreateDriver("");
	setCreateSponsor("");
	setCreateNumber("");
	setCreateAction("");
	setCreateDate("");

	fetchPointChangeCount();

} catch (error: any) {
	setCreateResult(`Error creating point change: ${error.message}`);
}
};

/**
 * Get Single Point Change (GET /pointchange)
 * Example usage: GET /pointchange?PointChangeID=123
 */
const handleGetPointChange = async () => {
try {
	const url = `${API_POINTCHANGES_URL}/pointchange?PointChangeID=${encodeURIComponent(getID)}`;
	const response = await fetch(url, { method: "GET" });
	if (!response.ok) {
	throw new Error(`Get failed: ${response.status}, ${await response.text()}`);
	}
	const data = await response.json();
	setPointChangeData(data);
	setGetError(null);
} catch (error: any) {
	setPointChangeData(null);
	setGetError(`Error fetching point change: ${error.message}`);
}
};

/**
 * Delete Point Change (DELETE /pointchange)
 * Typically, you can send PointChangeID in query params or body.
 * Example usage: DELETE /pointchange?PointChangeID=123
 */
const handleDeletePointChange = async () => {
try {
	const url = `${API_POINTCHANGES_URL}/pointchange?PointChangeID=${encodeURIComponent(deleteID)}`;

	// Make the DELETE request with no request body
	const response = await fetch(url, {
	method: "DELETE",
	});

	if (!response.ok) {
	throw new Error(`Delete failed: ${response.status}, ${await response.text()}`);
	}

	setDeleteResult("Point change deleted successfully!");
	setDeleteID("");

	// Optionally refresh pointChangeCount
	fetchPointChangeCount();
} catch (error: any) {
	setDeleteResult(`Error deleting point change: ${error.message}`);
}
};

// Fetch status & pointChangeCount once on mount
useEffect(() => {
fetchStatus();
fetchPointChangeCount();
}, []);

return (
<div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
	<div className="max-w-2xl w-full bg-white p-6 rounded shadow space-y-6">
	<h1 className="text-2xl font-bold text-center">Point Changes API</h1>

	{/* SECTION: Status & Point Change Count */}
	<section>
		<div className="space-y-2">
		<p>
			<strong>Status:</strong> {status !== null ? status : "Loading..."}
		</p>
		<p>
			<strong>Point Change Count:</strong>{" "}
			{pointChangeCount !== null ? pointChangeCount : "Loading..."}
		</p>
		<button
			onClick={() => {
			fetchStatus();
			fetchPointChangeCount();
			}}
			className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
		>
			Refresh
		</button>
		</div>
		<div className="mt-2">
		{/* Link to see all point changes (direct link, if your API returns HTML/JSON) */}
		<Link
			to={`${API_POINTCHANGES_URL}/pointchanges`}
			target="_blank"
			rel="noopener noreferrer"
			className="text-blue-600 underline"
		>
			See All Point Changes
		</Link>
		</div>
	</section>

	{/* SECTION: Create Point Change */}
	<section>
		<h2 className="text-xl font-semibold">Create Point Change</h2>
		<div className="space-y-2">
		<input
			type="text"
			placeholder="Driver"
			value={createDriver}
			onChange={(e) => setCreateDriver(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<input
			type="text"
			placeholder="Sponsor"
			value={createSponsor}
			onChange={(e) => setCreateSponsor(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<input
			type="number"
			placeholder="Number (e.g. 10.00)"
			value={createNumber}
			onChange={(e) => setCreateNumber(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<select
			value={createAction}
			onChange={(e) => setCreateAction(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		>
			<option value="">Select Action</option>
			{validPointChangeActions.map((action) => (
			<option key={action} value={action}>
				{action}
			</option>
			))}
		</select>
		<input
			type="date"
			placeholder="Date"
			value={createDate}
			onChange={(e) => setCreateDate(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<button
			onClick={handleCreatePointChange}
			className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
		>
			Create
		</button>
		{createResult && (
			<p className="text-sm text-green-600">{createResult}</p>
		)}
		</div>
	</section>

	{/* SECTION: Get Single Point Change */}
	<section>
		<h2 className="text-xl font-semibold">Get Point Change by ID</h2>
		<div className="space-y-2">
		<input
			type="text"
			placeholder="Point Change ID"
			value={getID}
			onChange={(e) => setGetID(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<button
			onClick={handleGetPointChange}
			className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
		>
			Get Point Change
		</button>
		{pointChangeData && (
			<div className="bg-gray-100 p-3 rounded mt-2 text-left">
			<pre className="text-sm whitespace-pre-wrap">
				{JSON.stringify(pointChangeData, null, 2)}
			</pre>
			</div>
		)}
		{getError && <p className="text-sm text-red-600">{getError}</p>}
		</div>
	</section>

	{/* SECTION: Delete Point Change */}
	<section>
		<h2 className="text-xl font-semibold">Delete Point Change</h2>
		<div className="space-y-2">
		<input
			type="text"
			placeholder="Point Change ID to Delete"
			value={deleteID}
			onChange={(e) => setDeleteID(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<button
			onClick={handleDeletePointChange}
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

export default PointChangesAPI;
