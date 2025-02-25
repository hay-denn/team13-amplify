import { Routes, Route } from "react-router-dom";
import APIDashboard from "../pages/APIDashboard";
import AdminsAPI from "../pages/APIs/AdminsAPI";
import DriversAPI from "../pages/APIs/DriversAPI";
import SponsorsAPI from "../pages/APIs/SponsorsAPI";
import ApplicationsAPI from "../pages/APIs/ApplicationsAPI";
import SponsorOrganizationsAPI from "../pages/APIs/SponsorOrganizationsAPI";
import PurchasesAPI from "../pages/APIs/PurchasesAPI";


const APIRoutes = () => {
  return (
    <Routes>
      <Route path="/api" element={<APIDashboard />} />
      <Route path="/api/admins" element={<AdminsAPI />} />
      <Route path="/api/drivers" element={<DriversAPI />} />
      <Route path="/api/sponsors" element={<SponsorsAPI />} />
      <Route path="/api/applications" element={<ApplicationsAPI />} />
      <Route path="/api/sponsororganizations" element={<SponsorOrganizationsAPI />} />
      <Route path="/api/purchases" element={<PurchasesAPI />} />
    </Routes>
  );
};

export default APIRoutes;
