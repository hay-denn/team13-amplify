import React, { useState, useEffect } from "react";

const API_BASE_URL = "https://0woutxiymc.execute-api.us-east-1.amazonaws.com/dev1";

const ProductDashboard: React.FC = () => {
// States for API status and product count
const [status, setStatus] = useState<string | null>(null);
const [productCount, setProductCount] = useState<number | null>(null);

// States for creating a product
const [productName, setProductName] = useState("");
const [productDescription, setProductDescription] = useState("");
const [productPrice, setProductPrice] = useState("");
const [productInventory, setProductInventory] = useState("");
const [createResult, setCreateResult] = useState<string | null>(null);

// States for getting a specific product
const [getProductID, setGetProductID] = useState("");
const [productData, setProductData] = useState<any>(null);
const [getError, setGetError] = useState<string | null>(null);

// States for updating a product
const [updateProductID, setUpdateProductID] = useState("");
const [updateName, setUpdateName] = useState("");
const [updateDescription, setUpdateDescription] = useState("");
const [updatePrice, setUpdatePrice] = useState("");
const [updateInventory, setUpdateInventory] = useState("");
const [updateResult, setUpdateResult] = useState<string | null>(null);

// States for deleting a product
const [deleteProductID, setDeleteProductID] = useState("");
const [deleteResult, setDeleteResult] = useState<string | null>(null);

// Fetch API status from /status
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

// Fetch product count from /product_count
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

// Create a new product using POST /product
const handleCreateProduct = async () => {
try {
	const response = await fetch(`${API_BASE_URL}/product`, {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
		ProductName: productName,
		ProductDescription: productDescription,
		ProductPrice: productPrice,
		ProductInventory: productInventory,
	}),
	});
	if (!response.ok) {
	throw new Error(`Create failed: ${response.status}, ${await response.text()}`);
	}
	setCreateResult("Product created successfully!");
	setProductName("");
	setProductDescription("");
	setProductPrice("");
	setProductInventory("");
	fetchProductCount();
} catch (error: any) {
	setCreateResult(`Error creating product: ${error.message}`);
}
};

// Get a specific product using GET /product?ProductID=...
const handleGetProduct = async () => {
try {
	const url = `${API_BASE_URL}/product?ProductID=${encodeURIComponent(getProductID)}`;
	const response = await fetch(url, { method: "GET" });
	if (!response.ok) {
	throw new Error(`Get failed: ${response.status}, ${await response.text()}`);
	}
	const data = await response.json();
	setProductData(data);
	setGetError(null);
} catch (error: any) {
	setProductData(null);
	setGetError(`Error fetching product: ${error.message}`);
}
};

// Update an existing product using PUT /product
const handleUpdateProduct = async () => {
try {
	// Build the update body dynamically
	const body: { [key: string]: any } = { ProductID: updateProductID };
	if (updateName.trim() !== "") body.ProductName = updateName;
	if (updateDescription.trim() !== "") body.ProductDescription = updateDescription;
	if (updatePrice.trim() !== "") body.ProductPrice = updatePrice;
	if (updateInventory.trim() !== "") body.ProductInventory = updateInventory;

	const response = await fetch(`${API_BASE_URL}/product`, {
	method: "PUT",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify(body),
	});
	if (!response.ok) {
	throw new Error(`Update failed: ${response.status}, ${await response.text()}`);
	}
	setUpdateResult("Product updated successfully!");
	setUpdateProductID("");
	setUpdateName("");
	setUpdateDescription("");
	setUpdatePrice("");
	setUpdateInventory("");
} catch (error: any) {
	setUpdateResult(`Error updating product: ${error.message}`);
}
};

// Delete a product using DELETE /product?ProductID=...
const handleDeleteProduct = async () => {
try {
	const url = `${API_BASE_URL}/product?ProductID=${encodeURIComponent(deleteProductID)}`;
	const response = await fetch(url, { method: "DELETE" });
	if (!response.ok) {
	throw new Error(`Delete failed: ${response.status}, ${await response.text()}`);
	}
	setDeleteResult("Product deleted successfully!");
	setDeleteProductID("");
	fetchProductCount();
} catch (error: any) {
	setDeleteResult(`Error deleting product: ${error.message}`);
}
};

useEffect(() => {
fetchStatus();
fetchProductCount();
}, []);

return (
<div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
	<div className="max-w-3xl w-full bg-white p-6 rounded shadow space-y-6">
	<h1 className="text-2xl font-bold text-center">Product Dashboard</h1>

	{/* Status & Count Section */}
	<section>
		<div className="space-y-2">
		<p><strong>Status:</strong> {status !== null ? status : "Loading..."}</p>
		<p><strong>Product Count:</strong> {productCount !== null ? productCount : "Loading..."}</p>
		<button onClick={() => { fetchStatus(); fetchProductCount(); }} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
			Refresh
		</button>
		</div>
		<div>
		<a href={`${API_BASE_URL}/products`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
			See All Products
		</a>
		</div>
	</section>

	{/* Create Product Section */}
	<section>
		<div className="space-y-2">
		<input type="text" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} className="border border-gray-300 p-2 w-full rounded" />
		<textarea placeholder="Product Description (optional)" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} className="border border-gray-300 p-2 w-full rounded" />
		<input type="text" placeholder="Product Price" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} className="border border-gray-300 p-2 w-full rounded" />
		<input type="text" placeholder="Product Inventory (optional)" value={productInventory} onChange={(e) => setProductInventory(e.target.value)} className="border border-gray-300 p-2 w-full rounded" />
		<button onClick={handleCreateProduct} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
			Create Product
		</button>
		{createResult && <p className="text-sm text-green-600">{createResult}</p>}
		</div>
	</section>

	{/* Get Specific Product Section */}
	<section>
		<div className="space-y-2">
		<input type="text" placeholder="Product ID" value={getProductID} onChange={(e) => setGetProductID(e.target.value)} className="border border-gray-300 p-2 w-full rounded" />
		<button onClick={handleGetProduct} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
			Get Product
		</button>
		{productData && (
			<div className="bg-gray-100 p-3 rounded mt-2">
			<pre className="text-sm whitespace-pre-wrap">{JSON.stringify(productData, null, 2)}</pre>
			</div>
		)}
		{getError && <p className="text-sm text-red-600">{getError}</p>}
		</div>
	</section>

	{/* Update Product Section */}
	<section>
		<div className="space-y-2">
		<input type="text" placeholder="Product ID" value={updateProductID} onChange={(e) => setUpdateProductID(e.target.value)} className="border border-gray-300 p-2 w-full rounded" />
		<input type="text" placeholder="New Product Name" value={updateName} onChange={(e) => setUpdateName(e.target.value)} className="border border-gray-300 p-2 w-full rounded" />
		<textarea placeholder="New Product Description" value={updateDescription} onChange={(e) => setUpdateDescription(e.target.value)} className="border border-gray-300 p-2 w-full rounded" />
		<input type="text" placeholder="New Product Price" value={updatePrice} onChange={(e) => setUpdatePrice(e.target.value)} className="border border-gray-300 p-2 w-full rounded" />
		<input type="text" placeholder="New Product Inventory" value={updateInventory} onChange={(e) => setUpdateInventory(e.target.value)} className="border border-gray-300 p-2 w-full rounded" />
		<button onClick={handleUpdateProduct} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
			Update Product
		</button>
		{updateResult && <p className="text-sm text-green-600">{updateResult}</p>}
		</div>
	</section>

	{/* Delete Product Section */}
	<section>
		<div className="space-y-2">
		<input type="text" placeholder="Product ID" value={deleteProductID} onChange={(e) => setDeleteProductID(e.target.value)} className="border border-gray-300 p-2 w-full rounded" />
		<button onClick={handleDeleteProduct} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
			Delete Product
		</button>
		{deleteResult && <p className="text-sm text-green-600">{deleteResult}</p>}
		</div>
	</section>
	</div>
</div>
);
};

export default ProductDashboard;
