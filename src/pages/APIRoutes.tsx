import { Routes, Route } from "react-router-dom";
import APIDashboard from "../pages/APIDashboard";
import AdminsAPI from "../pages/APIs/AdminsAPI";
import DriversAPI from "../pages/APIs/DriversAPI";
import SponsorsAPI from "../pages/APIs/SponsorsAPI";
import ApplicationsAPI from "../pages/APIs/ApplicationsAPI";
import SponsorOrganizationsAPI from "../pages/APIs/SponsorOrganizationsAPI";
import PurchasesAPI from "../pages/APIs/PurchasesAPI";
import CatalogAPI from "../pages/APIs/CatalogAPI";
import DriverSponsorAPI from "../pages/APIs/DriverSponsorAPI";
import PointChangesAPI from "../pages/APIs/PointChangesAPI";
import ProductAPI from "../pages/APIs/ProductAPI";
import ProductsPurchasedAPI from "../pages/APIs/ProductsPurchasedAPI";

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
      <Route path="/api/pointchanges" element={<PointChangesAPI />} />
      <Route path="/api/product" element={<ProductAPI />} />
      <Route path="/api/productspurchased" element={<ProductsPurchasedAPI />} />
      <Route path="/api/catalog" element={<CatalogAPI />} />
      <Route path="/api/driversponsors" element={<DriverSponsorAPI />} />
    </Routes>
  );
};

export default APIRoutes;
