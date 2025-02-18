import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { DashBoardHome } from "../components/DashBoardHome";
import { useAuth } from "react-oidc-context";

export const DriverDashboard = () => {
  const [companyName] = useState("Amazon");
  const auth = useAuth();

  return (
    <>
      <Navbar companyName={companyName} userType="Driver"></Navbar>
      <DashBoardHome
        userFName= {auth.user?.profile.name || "No Name"}
        companyName={companyName}
      ></DashBoardHome>
    </>
  );
};
