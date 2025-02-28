import { useAuth } from "react-oidc-context";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

// Pages
import About from "./pages/About";
import Home from "./pages/Home";
import { DriverDashboard } from "./pages/DriverDashboard";
import { SponsorDashboard } from "./pages/SponsorDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AccountSettings } from "./pages/AccountSettings";
import APIDashboard from "./pages/APIDashboard.tsx";
import APIRoutes from "./pages/APIRoutes.tsx";
import UserManageTest from "./pages/UserManageTest";
import { Manageusers } from "./pages/Manageusers.tsx";

function App() {
  const auth = useAuth();
  const cognitoGroups: string[] =
    (auth.user?.profile?.["cognito:groups"] as string[]) || [];
  const userGroup = cognitoGroups[0];

  if (auth.isLoading) return <div>Loading...</div>;
  if (auth.error) return <div>Encountering error... {auth.error.message}</div>;

  return (
    <Router>
      <Layout userType={userGroup}>
        <Routes>
          {auth.isAuthenticated ? (
            <>
              {userGroup === "Driver" && (
                <Route path="/" element={<DriverDashboard />} />
              )}
              {userGroup === "Sponsor" && (
                <Route path="/" element={<SponsorDashboard />} />
              )}
              {userGroup === "Admin" && (
                <>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/manageusers" element={<Manageusers />} />
                </>
              )}
              <Route path="/account" element={<AccountSettings />} />
              <Route path="/usermanagetest" element={<UserManageTest />} />
            </>
          ) : (
            <Route path="/" element={<Home />} />
          )}
          <Route path="/about" element={<About />} />
          <Route path="/api_dashboard" element={<APIDashboard />} />
        </Routes>
        <APIRoutes />
      </Layout>
    </Router>
  );
}

export default App;
