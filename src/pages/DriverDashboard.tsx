import { useState } from "react";
import { DashBoardHome } from "../components/DashBoardHome";
import { useAuth } from "react-oidc-context";

export const DriverDashboard = () => {
  const [companyName] = useState("Amazon");
  const auth = useAuth();

  return (
    <>
      <DashBoardHome
        userFName= {auth.user?.profile.name || "No Name"}
        companyName={companyName}
      ></DashBoardHome>
    </>
  );
};
