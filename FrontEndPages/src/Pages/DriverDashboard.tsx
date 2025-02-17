import { useState } from "react";
import { Navbar } from "../Components/Navbar";
import { DashBoardHome } from "../Components/DashBoardHome";

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
