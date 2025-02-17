import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { DashBoardHome } from "../components/DashBoardHome";

export const DriverDashboard = () => {
  const [companyName] = useState("Amazon");
  return (
    <>
      <Navbar companyName={companyName} userType="Driver"></Navbar>
      <DashBoardHome
        userFName="Matthew"
        companyName={companyName}
      ></DashBoardHome>
    </>
  );
};
