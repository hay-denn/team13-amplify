import { useAuth } from "react-oidc-context";
import { useState } from "react";
import { ListOfOrganizationsBox } from "../components/AdminBoxes/CompanyList";
import { CompanyListBox } from "../components/AdminBoxes/CompanyListBox";
interface Props {
  userFName?: string;
  companyName?: string;
}

export const AdminDashboard = ({}: Props) => {
  const auth = useAuth();
  const [currsponsor_email] = useState(auth.user?.profile.email || "");

  return (
    <>
      <div className="container my-4 ">
        <h1 className="text-center mb-5">Welcome Back {currsponsor_email}!</h1>

        <div className="row g-3">
          <div className="col-md-4">
            <div className="box box1">
              <CompanyListBox />
            </div>
          </div>

          <div className="col-md-6">
            <div className="box box2">
              <ListOfOrganizationsBox />
            </div>
          </div>
          <div className="col-md-2">
            <div className="box box1">Monthly Point Leaders</div>
          </div>
          <div className="col-md-4">
            <div className="box box3">Leading Users</div>
          </div>
          <div className="col-md-4">
            <div className="box box4">Placeholder</div>
          </div>
          <div className="col-md-4">
            <div className="box box5">
              Number Of Products in the Catalog: Placeholder
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
