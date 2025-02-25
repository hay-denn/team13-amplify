import { useState } from "react";
import { DashBoardHome } from "../components/DashBoardHome";
import { useAuth } from "react-oidc-context";

export const DriverDashboard = () => {
  const [companyName] = useState("");
  const auth = useAuth();

  return (
    <>
      <DashBoardHome
        userFName= {auth.user?.profile.given_name || "Driver"}
        companyName={companyName}
      ></DashBoardHome>
    </>
  );
};
