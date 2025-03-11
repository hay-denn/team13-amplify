import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "https://0woutxiymc.execute-api.us-east-1.amazonaws.com/dev1";

const ProductAPI: React.FC = () => {
// States for /status & /product_count
const [status, setStatus] = useState<string | null>(null);
const [productCount, setProductCount] = useState<number | null>(null);

// States for Create Organization (POST /product)
const [createName, setCreateName] = useState("");
const [createResult, setCreateResult] = useState<string | null>(null);

// States for Get Organization (GET /product)
const [getID, setGetID] = useState("");
const [productData, setProductData] = useState<any>(null);
const [getError, setGetError] = useState<string | null>(null);

// States for Update Organization (PUT /products)
const [updateID, setUpdateID] = useState("");
const [updateName, setUpdateName] = useState("");
const [updateResult, setUpdateResult] = useState<string | null>(null);

// States for Delete Organization (DELETE /products)
const [deleteID, setDeleteID] = useState("");
const [deleteResult, setDeleteResult] = useState<string | null>(null);

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
 * Fetch product count (GET /product_count)
 */
const fetchProductCount = async () => {
try {
	const res = await fetch(`${API_BASE_URL}/product_count`);
	if (!res.ok) {
	throw new Error(`Product count fetch failed: ${res.status}`);
	}
	const data = await res.json();
	setProductCount(data.count);
} catch (err: any) {
	setProductCount(null);
}
};

/**
 * Create Organization (POST /product)
 * Expects body: { OrganizationName }
 */
const handleCreateProduct = async () => {
try {
	const response = await fetch(`${API_BASE_URL}/product`, {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
		OrganizationName: createName,
	}),
	});
	if (!response.ok) {
	throw new Error(`Create failed: ${response.status}, ${await response.text()}`);
	}
	setCreateResult("Organization created successfully!");
	setCreateName("");
	// Refresh product count after creation
	fetchProductCount();
} catch (error: any) {
	setCreateResult(`Error creating organization: ${error.message}`);
}
};

/**
 * Get Organization (GET /product)
 * Note: The API expects OrganizationID in the request body.
 */
const handleGetProduct = async () => {
try {
	const response = await fetch(`${API_BASE_URL}/product`, {
	method: "GET",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({ OrganizationID: getID }),
	});
	if (!response.ok) {
	throw new Error(`Get failed: ${response.status}, ${await response.text()}`);
	}
	const data = await response.json();
	setProductData(data);
	setGetError(null);
} catch (error: any) {
	setProductData(null);
	setGetError(`Error fetching organization: ${error.message}`);
}
};

/**
 * Update Organization (PUT /products)
 * Expects body: { OrganizationID, OrganizationName }
 */
const handleUpdateProduct = async () => {
try {
	const requestBody = {
	OrganizationID: updateID,
	OrganizationName: updateName,
	};
	const response = await fetch(`${API_BASE_URL}/products`, {
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
 * Delete Organization (DELETE /products)
 * Expects body: { OrganizationID }
 */
const handleDeleteProduct = async () => {
try {
	const response = await fetch(`${API_BASE_URL}/products`, {
	method: "DELETE",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({ OrganizationID: deleteID }),
	});
	if (!response.ok) {
	throw new Error(`Delete failed: ${response.status}, ${await response.text()}`);
	}
	setDeleteResult("Organization deleted successfully!");
	setDeleteID("");
	// Refresh product count after deletion
	fetchProductCount();
} catch (error: any) {
	setDeleteResult(`Error deleting organization: ${error.message}`);
}
};

// Fetch status and product count on mount
useEffect(() => {
fetchStatus();
fetchProductCount();
}, []);

return (
<div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
	<div className="max-w-2xl w-full bg-white p-6 rounded shadow space-y-6">
	<h1 className="text-2xl font-bold text-center">Product API Dashboard</h1>

	{/* SECTION: Status & Product Count */}
	<section>
		<div className="space-y-2">
		<p>
			<strong>Status:</strong> {status !== null ? status : "Loading..."}
		</p>
		<p>
			<strong>Product Count:</strong>{" "}
			{productCount !== null ? productCount : "Loading..."}
		</p>
		<button
			onClick={() => {
			fetchStatus();
			fetchProductCount();
			}}
			className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
		>
			Refresh
		</button>
		</div>
		<div>
		{/* Link to see all organizations */}
		<Link to={`${API_BASE_URL}/products`}>See All Organizations</Link>
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
			onClick={handleCreateProduct}
			className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
		>
			Create Organization
		</button>
		{createResult && (
			<p className="text-sm text-green-600">{createResult}</p>
		)}
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
			onClick={handleGetProduct}
			className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
		>
			Get Organization
		</button>
		{productData && (
			<div className="bg-gray-100 p-3 rounded mt-2 text-left">
			<pre className="text-sm whitespace-pre-wrap">
				{JSON.stringify(productData, null, 2)}
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
			onClick={handleUpdateProduct}
			className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
		>
			Update Organization
		</button>
		{updateResult && (
			<p className="text-sm text-green-600">{updateResult}</p>
		)}
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
			onClick={handleDeleteProduct}
			className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
		>
			Delete Organization
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

export default ProductAPI;
