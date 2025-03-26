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
import  Reports  from "./pages/Reports.tsx";
import { OrganizationSettings } from "./pages/OrganizationSettings.tsx";
import { DriverCatalogsTest } from "./pages/DriverCatalogsTest.tsx";

function App() {
  const auth = useAuth();
  const cognitoGroups: string[] =
    (auth.user?.profile?.["cognito:groups"] as string[]) || [];

  // production code
  /* Start production block */
  const userEmail = auth.user?.profile.email || "";
  const userGroup = cognitoGroups[0];
  /* End production block */

  // overwrites for testing, comment out for production
  /* start testing block */
  // const userGroup = "Driver";
  // const userEmail = "noahamn@gmail.com";
  // auth.isAuthenticated = true;
  /* end testing block */

  return (
    <CartProvider>
      <Router>
        <Layout userType={userGroup} userEmail={userEmail}>
          <Routes>
            {auth.isAuthenticated ? (
              <>
                {userGroup === "Driver" && (
                  <>
                    <Route path="/" element={<DriverDashBoard />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/sponsors" element={<SponsorExplore />} />
                    <Route path="/sponsors/:id" element={<SponsorProfile />} />
                    <Route path="/catalog" element={<DriverCatalogs />} />
                    <Route
                      path="/catalog-test"
                      element={<DriverCatalogsTest />}
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
                      path={`/organization/settings`}
                      element={<OrganizationSettings userEmail={userEmail} />}
                    />
                  </>
                )}

                {userGroup === "Admin" && (
                  <>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/manageusers" element={<Manageusers />} />
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
    </CartProvider>
  );
}

export default App;
