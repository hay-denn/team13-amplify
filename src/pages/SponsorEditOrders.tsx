import React, { useState, useEffect } from "react";

interface Order {
  orderId: number;
  itemName: string;
  quantity: number;
  cost: number;
  date: string;
}

export const SponsorEditOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const driverEmail = localStorage.getItem("driverEmailForEdit") || "";

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://ptgem248l6.execute-api.us-east-1.amazonaws.com/dev1/orders?driverEmail=${encodeURIComponent(driverEmail)}`
        );
        if (!response.ok) {
          throw new Error(`Error fetching orders: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Unexpected response format");
        }
        setOrders(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (driverEmail) {
      fetchOrders();
    } else {
      setError("Driver email not found in localStorage.");
      setLoading(false);
    }
  }, [driverEmail]);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

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
              <th>Item</th>
              <th>Quantity</th>
              <th>Cost</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderId}>
                <td>{order.orderId}</td>
                <td>{order.itemName}</td>
                <td>{order.quantity}</td>
                <td>{order.cost}</td>
                <td>{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};