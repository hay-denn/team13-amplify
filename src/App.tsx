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

  const signOutRedirect = () => {
    const clientId = "r7oq53d98cg6a8l4cj6o8l7tm";
    const logoutUri = "https://main.d1zgxgaa1s4k42.amplifyapp.com/";
    const cognitoDomain = "https://us-east-1jnojoftl2.auth.us-east-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
};

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
      {/* Navbar with buttons for navigation
      <header className="navbar">
        <nav className="nav-links">
          <button onClick={() => setCurrentPage("home")}>Home</button> |{" "}
          <button onClick={() => setCurrentPage("about")}>About</button> |{" "}
          <button onClick={() => auth.signinRedirect()}>Sign in</button> |{" "}
          <button onClick={() => auth.signinRedirect({ extraQueryParams: { prompt: "signup" } })}>Sign up</button>
        </nav>
      </header> */}

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
