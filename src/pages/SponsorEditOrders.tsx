import React, { useState, useEffect } from "react";

interface Order {
  orderId: number;
  driver: string;
  date: string;
  status: string;
}

export const SponsorEditOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Parse the stored data to retrieve both the driver email and the sponsor ID
  const storedData = localStorage.getItem("driverEmailForEdit");
  let driverEmail = "";
  let sponsorId = "";
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData);
      driverEmail = parsed.driverEmail || "";
      sponsorId = parsed.sponsorOrgID || "";
      console.log("Parsed storedData:", parsed);
    } catch (e) {
      console.error("Error parsing driverEmailForEdit:", e);
    }
  }
  console.log("Driver Email:", driverEmail, "Sponsor ID:", sponsorId);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const encodedEmail = encodeURIComponent(driverEmail.replace(/ /g, "+"));
        const url = `https://mk7fc3pb53.execute-api.us-east-1.amazonaws.com/dev1/purchases?PurchaseSponsorID=${sponsorId}&PurchaseDriver=${encodedEmail}`;
        console.log("Fetching orders from URL:", url);
        const response = await fetch(url);
        console.log("Response status:", response.status);
        if (!response.ok) {
          throw new Error(`Error fetching orders: ${response.status}`);
        }

        const data = await response.json();
        console.log("Data fetched:", data);
        if (!Array.isArray(data)) {
          throw new Error("Unexpected response format");
        }

        // Map the database fields to our Order type.
        const mappedOrders: Order[] = data.map((purchase: any) => ({
          orderId: purchase.PurchaseID,
          driver: purchase.PurchaseDriver,
          date: new Date(purchase.PurchaseDate).toLocaleDateString(),
          status: purchase.PurchaseStatus,
        }));

        console.log("Mapped Orders:", mappedOrders);
        setOrders(mappedOrders);
        setLoading(false);
      } catch (err: any) {
        console.error("Error encountered:", err.message);
        setError(err.message);
        setLoading(false);
      }
    };

    if (driverEmail && sponsorId) {
      fetchOrders();
    } else {
      console.error("Driver email or sponsor ID not found in localStorage.");
      setError("Driver email or sponsor ID not found in localStorage.");
      setLoading(false);
    }
  }, [driverEmail, sponsorId]);

  if (loading) {
    console.log("Loading orders...");
    return <div>Loading orders...</div>;
  }

  if (error) {
    console.log("Error:", error);
    return <div>Error: {error}</div>;
  }

  console.log("Rendering orders table.");
  return (
    <div className="container">
      <h1>Edit Orders for {driverEmail}</h1>
      {orders.length === 0 ? (
        <p>No orders found for this driver.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Driver</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId}>
                <td>{order.orderId}</td>
                <td>{order.driver}</td>
                <td>{order.date}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SponsorEditOrders;