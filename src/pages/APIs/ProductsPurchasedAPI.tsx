import React, { useState, useEffect } from "react";

const API_PRODUCTS_PURCHASED_URL = import.meta.env.VITE_API_PRODUCTS_PURCHASED;

const ProductsPurchasedAPI: React.FC = () => {
// States for /status & /productspurchased_count
const [status, setStatus] = useState<string | null>(null);
const [purchaseCount, setPurchaseCount] = useState<number | null>(null);

// States for Create Product Purchase (POST /productpurchased)
const [createProductPurchasedID, setCreateProductPurchasedID] = useState("");
const [createPurchaseAssociatedID, setCreatePurchaseAssociatedID] = useState("");
const [createQuantity, setCreateQuantity] = useState("");
const [createResult, setCreateResult] = useState<string | null>(null);

// States for Get Product Purchase (GET /productpurchased)
const [getProductPurchasedID, setGetProductPurchasedID] = useState("");
const [getPurchaseAssociatedID, setGetPurchaseAssociatedID] = useState("");
const [productPurchaseData, setProductPurchaseData] = useState<any>(null);
const [getError, setGetError] = useState<string | null>(null);

// States for Update Product Purchase (PUT /productpurchased)
const [updateProductPurchasedID, setUpdateProductPurchasedID] = useState("");
const [updatePurchaseAssociatedID, setUpdatePurchaseAssociatedID] = useState("");
const [updateQuantity, setUpdateQuantity] = useState("");
const [updateResult, setUpdateResult] = useState<string | null>(null);

// States for Delete Product Purchase (DELETE /productpurchased)
const [deleteProductPurchasedID, setDeleteProductPurchasedID] = useState("");
const [deletePurchaseAssociatedID, setDeletePurchaseAssociatedID] = useState("");
const [deleteResult, setDeleteResult] = useState<string | null>(null);

/**
 * Fetch API status (GET /status)
 */
const fetchStatus = async () => {
try {
	const res = await fetch(`${API_PRODUCTS_PURCHASED_URL}/status`);
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
 * Fetch product purchase count (GET /productspurchased_count)
 */
const fetchPurchaseCount = async () => {
try {
	const res = await fetch(`${API_PRODUCTS_PURCHASED_URL}/productspurchased_count`);
	if (!res.ok) {
	throw new Error(`Count fetch failed: ${res.status}`);
	}
	const data = await res.json();
	setPurchaseCount(data.count);
} catch (err: any) {
	setPurchaseCount(null);
}
};

/**
 * Create Product Purchase (POST /productpurchased)
 */
const handleCreateProductPurchase = async () => {
try {
	const response = await fetch(`${API_PRODUCTS_PURCHASED_URL}/productpurchased`, {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
		ProductPurchasedID: createProductPurchasedID,
		PurchaseAssociatedID: createPurchaseAssociatedID,
		ProductPurchaseQuantity: createQuantity,
	}),
	});
	if (!response.ok) {
	throw new Error(`Create failed: ${response.status}, ${await response.text()}`);
	}
	setCreateResult("Product purchase created successfully!");
	setCreateProductPurchasedID("");
	setCreatePurchaseAssociatedID("");
	setCreateQuantity("");
	fetchPurchaseCount();
} catch (error: any) {
	setCreateResult(`Error creating product purchase: ${error.message}`);
}
};

/**
 * Get Product Purchase (GET /productpurchased)
 */
const handleGetProductPurchase = async () => {
try {
	const url = `${API_PRODUCTS_PURCHASED_URL}/productpurchased?ProductPurchasedID=${encodeURIComponent(
	getProductPurchasedID
	)}&PurchaseAssociatedID=${encodeURIComponent(getPurchaseAssociatedID)}`;
	const response = await fetch(url, { method: "GET" });
	if (!response.ok) {
	throw new Error(`Get failed: ${response.status}, ${await response.text()}`);
	}
	const data = await response.json();
	setProductPurchaseData(data);
	setGetError(null);
} catch (error: any) {
	setProductPurchaseData(null);
	setGetError(`Error fetching product purchase: ${error.message}`);
}
};

/**
 * Update Product Purchase Quantity (PUT /productpurchased)
 */
const handleUpdateProductPurchase = async () => {
try {
	const requestBody = {
	ProductPurchasedID: updateProductPurchasedID,
	PurchaseAssociatedID: updatePurchaseAssociatedID,
	ProductPurchaseQuantity: updateQuantity,
	};
	const response = await fetch(`${API_PRODUCTS_PURCHASED_URL}/productpurchased`, {
	method: "PUT",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify(requestBody),
	});
	if (!response.ok) {
	throw new Error(`Update failed: ${response.status}, ${await response.text()}`);
	}
	setUpdateResult("Product purchase quantity updated successfully!");
	setUpdateProductPurchasedID("");
	setUpdatePurchaseAssociatedID("");
	setUpdateQuantity("");
} catch (error: any) {
	setUpdateResult(`Error updating product purchase: ${error.message}`);
}
};

/**
 * Delete Product Purchase (DELETE /productpurchased)
 */
const handleDeleteProductPurchase = async () => {
try {
	const url = `${API_PRODUCTS_PURCHASED_URL}/productpurchased?ProductPurchasedID=${encodeURIComponent(
	deleteProductPurchasedID
	)}&PurchaseAssociatedID=${encodeURIComponent(deletePurchaseAssociatedID)}`;
	const response = await fetch(url, { method: "DELETE" });
	if (!response.ok) {
	throw new Error(`Delete failed: ${response.status}, ${await response.text()}`);
	}
	setDeleteResult("Product purchase deleted successfully!");
	setDeleteProductPurchasedID("");
	setDeletePurchaseAssociatedID("");
	fetchPurchaseCount();
} catch (error: any) {
	setDeleteResult(`Error deleting product purchase: ${error.message}`);
}
};

useEffect(() => {
fetchStatus();
fetchPurchaseCount();
}, []);

return (
<div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
	<div className="max-w-2xl w-full bg-white p-6 rounded shadow space-y-6">
	<h1 className="text-2xl font-bold text-center">Products Purchased Dashboard</h1>

	{/* SECTION: Status & Count */}
	<section>
		<div className="space-y-2">
		<p>
			<strong>Status:</strong> {status !== null ? status : "Loading..."}
		</p>
		<p>
			<strong>Product Purchase Count:</strong>{" "}
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
		{/* Link to see all product purchases */}
		<a
			href={`${API_PRODUCTS_PURCHASED_URL}/productspurchased`}
			target="_blank"
			rel="noopener noreferrer"
		>
			See All Product Purchases
		</a>
		</div>
	</section>

	{/* SECTION: Create Product Purchase */}
	<section>
		<div className="space-y-2">
		<input
			type="text"
			placeholder="Product Purchased ID"
			value={createProductPurchasedID}
			onChange={(e) => setCreateProductPurchasedID(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<input
			type="text"
			placeholder="Purchase Associated ID"
			value={createPurchaseAssociatedID}
			onChange={(e) => setCreatePurchaseAssociatedID(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<input
			type="number"
			placeholder="Product Purchase Quantity"
			value={createQuantity}
			onChange={(e) => setCreateQuantity(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<button
			onClick={handleCreateProductPurchase}
			className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
		>
			Create
		</button>
		{createResult && (
			<p className="text-sm text-green-600">{createResult}</p>
		)}
		</div>
	</section>

	{/* SECTION: Get Product Purchase */}
	<section>
		<div className="space-y-2">
		<input
			type="text"
			placeholder="Product Purchased ID"
			value={getProductPurchasedID}
			onChange={(e) => setGetProductPurchasedID(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<input
			type="text"
			placeholder="Purchase Associated ID"
			value={getPurchaseAssociatedID}
			onChange={(e) => setGetPurchaseAssociatedID(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<button
			onClick={handleGetProductPurchase}
			className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
		>
			Get
		</button>
		{productPurchaseData && (
			<div className="bg-gray-100 p-3 rounded mt-2 text-left">
			<pre className="text-sm whitespace-pre-wrap">
				{JSON.stringify(productPurchaseData, null, 2)}
			</pre>
			</div>
		)}
		{getError && <p className="text-sm text-red-600">{getError}</p>}
		</div>
	</section>

	{/* SECTION: Update Product Purchase */}
	<section>
		<div className="space-y-2">
		<input
			type="text"
			placeholder="Product Purchased ID"
			value={updateProductPurchasedID}
			onChange={(e) => setUpdateProductPurchasedID(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<input
			type="text"
			placeholder="Purchase Associated ID"
			value={updatePurchaseAssociatedID}
			onChange={(e) => setUpdatePurchaseAssociatedID(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<input
			type="number"
			placeholder="New Purchase Quantity"
			value={updateQuantity}
			onChange={(e) => setUpdateQuantity(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<button
			onClick={handleUpdateProductPurchase}
			className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
		>
			Update
		</button>
		{updateResult && (
			<p className="text-sm text-green-600">{updateResult}</p>
		)}
		</div>
	</section>

	{/* SECTION: Delete Product Purchase */}
	<section>
		<div className="space-y-2">
		<input
			type="text"
			placeholder="Product Purchased ID"
			value={deleteProductPurchasedID}
			onChange={(e) => setDeleteProductPurchasedID(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<input
			type="text"
			placeholder="Purchase Associated ID"
			value={deletePurchaseAssociatedID}
			onChange={(e) => setDeletePurchaseAssociatedID(e.target.value)}
			className="border border-gray-300 p-2 w-full rounded"
		/>
		<button
			onClick={handleDeleteProductPurchase}
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

export default ProductsPurchasedAPI;
