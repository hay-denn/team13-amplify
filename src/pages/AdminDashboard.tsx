import { Navbar } from "../components/Navbar";
import { AdminDashBoardHome } from "../components/AdminDashBoardHome";
import { Manageusers } from "./Manageusers";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
export const AdminDashboard = () => {
  return (
    <>
      <div>
        <Navbar userType="Admin"></Navbar>
        <Router>
          <Routes>
            <Route path="/" element={<AdminDashBoardHome />} />
            <Route path="/page1" element={<Manageusers />} />
          </Routes>
        </Router>
      </div>
      ;
    </>
  );
};
