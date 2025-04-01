import React, { useState, useEffect } from "react";

interface Order {
  orderId: number;
  driver: string;
  date: string;
  status: string;
  price: number;
}

export const SponsorEditOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Parse the stored data to retrieve driver email, sponsor ID, and sponsor email
  const storedData = localStorage.getItem("driverEmailForEdit");
  let driverEmail = "";
  let sponsorId = "";
  let sponsorEmail = "";
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData);
      driverEmail = parsed.driverEmail || "";
      sponsorId = parsed.sponsorOrgID || "";
      sponsorEmail = parsed.sponsorEmail || "";
      console.log("Parsed storedData:", parsed);
    } catch (e) {
      console.error("Error parsing driverEmailForEdit:", e);
    }
  }
  console.log("Driver Email:", driverEmail, "Sponsor ID:", sponsorId, "Sponsor Email:", sponsorEmail);

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
        // The database returns:
        // PurchaseID, PurchaseDriver, PurchaseDate, PurchaseStatus, PurchasePrice, PurchaseSponsorID
        const mappedOrders: Order[] = data.map((purchase: any) => ({
          orderId: purchase.PurchaseID,
          driver: purchase.PurchaseDriver,
          date: new Date(purchase.PurchaseDate).toLocaleDateString(),
          status: purchase.PurchaseStatus,
          price: purchase.PurchasePrice,
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
      console.error("Driver email or sponsor ID not found in stored data.");
      setError("Driver email or sponsor ID not found in stored data.");
      setLoading(false);
    }
  }, [driverEmail, sponsorId]);

  const handleStatusChange = async (order: Order, newStatus: string) => {
    try {
      console.log("Updating status for order:", order.orderId, "to", newStatus);
      // Request to update the purchase status
      const updateResponse = await fetch(
        "https://mk7fc3pb53.execute-api.us-east-1.amazonaws.com/dev1/purchase",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            PurchaseID: order.orderId,
            PurchaseStatus: newStatus,
          }),
        }
      );
      console.log("Update response status:", updateResponse.status);
      if (!updateResponse.ok) {
        throw new Error(`Error updating purchase status: ${updateResponse.status}`);
      }
      // If status is set to "Cancelled", post to pointchange endpoint
      if (newStatus === "Cancelled") {
        const pointChangeResponse = await fetch(
          "https://kco45spzej.execute-api.us-east-1.amazonaws.com/dev1/pointchange",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              PointChangeDriver: order.driver,
              PointChangeSponsor: sponsorEmail,
              PointChangeNumber: order.price,
              PointChangeAction: "Add",
            }),
          }
        );
        console.log("Point change response status:", pointChangeResponse.status);
        if (!pointChangeResponse.ok) {
          throw new Error(`Error updating point change: ${pointChangeResponse.status}`);
        }
      }
      // Update local state with the new status for this order
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.orderId === order.orderId ? { ...o, status: newStatus } : o
        )
      );
      console.log("Order updated successfully.");
    } catch (error: any) {
      console.error("Error in handleStatusChange:", error.message);
    }
  };

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
    <div className="container" style={{ marginTop: "80px" }}>
      <h1>Edit Orders for {driverEmail}</h1>
      {orders.length === 0 ? (
        <p>No orders found for this driver.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Price</th>
              <th>Driver</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId}>
                <td>{order.orderId}</td>
                <td>{order.price}</td>
                <td>{order.driver}</td>
                <td>{order.date}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order, e.target.value)}
                  >
                    <option value="Ordered">Ordered</option>
                    <option value="Processing">Processing</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SponsorEditOrders;