import { useAuth } from "react-oidc-context";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

// Pages
import About from "./pages/About";
import Home from "./pages/DriverHomeStyles.tsx";
import { DriverDashBoard } from "./pages/DriverDashboard.tsx";
import { SponsorDashboard } from "./pages/SponsorDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AccountSettings } from "./pages/AccountSettings";
import APIDashboard from "./pages/APIDashboard.tsx";
import APIRoutes from "./pages/APIRoutes.tsx";
import { Manageusers } from "./pages/Manageusers.tsx";
import { DriverManagement } from "./pages/DriverManagement.tsx";
import SponsorCatalogs from "./pages/SponsorCatalogs.tsx";
import { CartPage, CartProvider } from "./pages/CartContext";
import { SponsorExplore } from "./pages/SponsorExplore.tsx";
import { SponsorProfile } from "./pages/SponsorProfile.tsx";
import { DriverCatalogs } from "./pages/DriverCatalogs.tsx";
import Reports from "./pages/Reports.tsx";
import { OrganizationSettings } from "./pages/OrganizationSettings.tsx";
import { DriverCatalogsTest } from "./pages/DriverCatalogsTest.tsx";
import { SponsorEditOrders } from "./pages/SponsorEditOrders.tsx";
import { DriverMyApplications } from "./pages/DriverMyApplications.tsx";
import { DriverMySponsors } from "./pages/DriverMySponsors.tsx";
import { Footer } from "./components/Footer.tsx";
import { ManageSponsors } from "./pages/ManageSponsors.tsx";
function App() {
  const auth = useAuth();
  const cognitoGroups: string[] =
    (auth.user?.profile?.["cognito:groups"] as string[]) || [];

  const userEmail = auth.user?.profile.email || "";
  const userGroup = cognitoGroups[0];

  // const userEmail = "noahamn@gmail.com";
  // const userGroup = "Sponsor";
  // auth.isAuthenticated = true;

  return (
    <CartProvider>
      <Router>
        <Layout userType={userGroup} userEmail={userEmail}>
          <Routes>
            {auth.isAuthenticated ? (
              <>
                {/* Route for viewing driver dashboard when logged in as a sponsor */}
                <Route path="/driver-dashboard" element={<DriverDashBoard />} />
                <Route path="/cart" element={<CartPage />} />
                <Route
                  path="/catalog"
                  element={<DriverCatalogs inputUserEmail={userEmail} />}
                />

                {userGroup === "Driver" && (
                  <>
                    <Route path="/" element={<DriverDashBoard />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/sponsors" element={<SponsorExplore />} />
                    <Route
                      path="/sponsors/:id"
                      element={<SponsorProfile inputUserEmail={userEmail} />}
                    />
                    <Route
                      path="/catalog"
                      element={<DriverCatalogs inputUserEmail={userEmail} />}
                    />
                    <Route
                      path="/myapplications"
                      element={
                        <DriverMyApplications inputUserEmail={userEmail} />
                      }
                    />
                    <Route path="/mysponsors" element={<DriverMySponsors />} />
                    <Route
                      path="/catalog-test"
                      element={
                        <DriverCatalogsTest inputUserEmail={userEmail} />
                      }
                    />
                  </>
                )}

                {userGroup === "Sponsor" && (
                  <>
                    <Route path="/" element={<SponsorDashboard />} />
                    <Route
                      path="/DriverManagement"
                      element={<DriverManagement />}
                    />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/catalogs" element={<SponsorCatalogs />} />
                    <Route
                      path="/edit-orders"
                      element={<SponsorEditOrders />}
                    />
                    <Route
                      path={`/organization/settings`}
                      element={<OrganizationSettings userEmail={userEmail} />}
                    />
                  </>
                )}

                {userGroup === "Admin" && (
                  <>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/manageusers" element={<Manageusers />} />
                    <Route
                      path="/managesponsors"
                      element={<ManageSponsors />}
                    />
                    <Route path="/reports" element={<Reports />} />
                  </>
                )}

                <Route path="/account" element={<AccountSettings />} />
              </>
            ) : (
              <Route path="/" element={<Home />} />
            )}

            <Route path="/about" element={<About />} />
            <Route path="/api_dashboard" element={<APIDashboard />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>

          <APIRoutes />
        </Layout>
      </Router>
      <Footer />
    </CartProvider>
  );
}

export default App;
