import { useAuth } from "react-oidc-context";
import { useState } from "react";
import Home from './pages/Home';
import About from './pages/About';
import Driver from './pages/Driver';
import Sponsor from './pages/Sponsor';
import Admin from './pages/Admin';
import DriverDashboard from './dashboards/DriverDashboard';
import SponsorDashboard from './dashboards/SponsorDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

function App() {
  const auth = useAuth();
  const [currentPage, setCurrentPage] = useState("home"); // Track active page

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {

    /* Obtain the group the user is assigned to in Cognito */
    const cognitoGroups: string[] = auth.user?.profile?.["cognito:groups"] as string[] || [];
    const userGroup = cognitoGroups[0];

    switch (userGroup) {
      case "Driver":
        return <DriverDashboard />;
      case "Sponsor":
        return <SponsorDashboard />;
      case "Admin":
        return <AdminDashboard />;
      default:
        return <div>Access Denied</div>;
    }
  }

  return (
    <div>
      {/* Left Side - Info Links */}
      <header className="navbar">
        {/* Navbar with buttons for navigation */}
        <nav className="nav-links">
          <button className="nav-button" onClick={() => setCurrentPage("home")}>Home</button>
          <span className="divider">|</span>
          <button className="nav-button" onClick={() => setCurrentPage("about")}>About</button>
        </nav>

        {/* Middle - Home Redirect */}
        <div className="home-button">
          <a href="/" className="home-link">Drive Rewards</a>
        </div>

        {/* Right Side - Authentication Links */}
        <div className="auth-buttons">
          <button className="auth-button" onClick={() => auth.signinRedirect()}>Sign in</button>
          <span className="divider">|</span>
          <button className="auth-button" onClick={() => auth.signinRedirect({ extraQueryParams: { prompt: "signup" } })}>Sign up</button>
        </div>
      </header>

      {/* Render the selected page */}
      <main>
        {currentPage === "home" && <Home />}
        {currentPage === "about" && <About />}
        {currentPage === "driver" && <Driver />}
        {currentPage === "sponsor" && <Sponsor />}
        {currentPage === "admin" && <Admin />}
      </main>
    </div>
  );
}

export default App;
