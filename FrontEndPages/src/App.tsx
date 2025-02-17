import { useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { DriverDashboard } from "./Pages/DriverDashboard";
import { AdminDashboard } from "./Pages/AdminDashboard";
function App() {
  const [userType] = useState("Admin");
  return (
    <>
      {userType === "Driver" ? (
        <DriverDashboard></DriverDashboard>
      ) : (
        <AdminDashboard></AdminDashboard>
      )}
    </>
  );
}

export default App;
