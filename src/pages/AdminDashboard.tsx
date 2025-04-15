import { useAuth } from "react-oidc-context";
import { useState } from "react";
import { ListOfOrganizationsBox } from "../components/AdminBoxes/CompanyList";
import { CompanyListBox } from "../components/AdminBoxes/CompanyListBox";
import { AdminStats } from "../components/AdminBoxes/adminstats";
import { PurchaseByMonth } from "../components/SponsorDashBoardBoxes/PurchaseByMonth";
import "./AdminDashboard.css";
interface Props {
  userFName?: string;
  companyName?: string;
}

export const AdminDashboard = ({}: Props) => {
  const auth = useAuth();
  const [currsponsor_name] = useState(auth.user?.profile.given_name || "");

  return (
    <div className="container my-4">
      <h1 className="welcome-message">Welcome Back {currsponsor_name}!</h1>
      <div className="row g-3">
        <div className="col-md-4">
          <div className="box box1 p-3">
            <CompanyListBox />
          </div>
        </div>
        <div className="col-md-6">
          <div className="box box2 p-3">
            <ListOfOrganizationsBox />
          </div>
        </div>
        <div className="col-md-2">
          <div className="box box1 p-3">
            <AdminStats />
          </div>
        </div>
        <div className="col-md-4">
          <div className="box box3 p-3">
            <PurchaseByMonth SponsorID="ADMIN"></PurchaseByMonth>
          </div>
        </div>
        <div className="col-md-4">
          <div className="box box4 p-3">Placeholder</div>
        </div>
        <div className="col-md-4">
          <div className="box box5 p-3">
            Number Of Products in the Catalog: Placeholder
          </div>
        </div>
      </div>
    </div>
  );
};
