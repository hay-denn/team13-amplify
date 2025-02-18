//react or amplify components
import { useAuth } from "react-oidc-context";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import { useState } from "react";

//our components
import { Navbar } from './components/Navbar'

//pages
import About from './pages/About';
import Home from './pages/Home' //this is the 'home' page for non-signed in users
import { DriverDashboard } from './pages/DriverDashboard';
import { SponsorDashboard } from './pages/SponsorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AccountSettings } from "./pages/AccountSettings";


function App() {
  const auth = useAuth();
  const cognitoGroups: string[] = auth.user?.profile?.["cognito:groups"] as string[] || [];
  const userGroup = cognitoGroups[0];


  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    /* Obtain the group the user is assigned to in Cognito */
    switch (userGroup) {
      case "Driver":
        return (
          <div>
            <Router>
            <Navbar companyName="Placeholder"userType="Driver"></Navbar>
              <Routes>
                <Route path="/" element={<DriverDashboard />} />
                <Route path="/about" element={<About />} />
                <Route path="/account" element={<AccountSettings />} />
              </Routes>
            </Router>
          </div>
        );
      case "Sponsor":
        return (
          <div>
            <Router>
            <Navbar companyName="Placeholder" userType="Sponsor"></Navbar>
              <Routes>
                <Route path="/" element={<SponsorDashboard />} />
                <Route path="/about" element={<About />} />
                <Route path="/account" element={<AccountSettings />} />
              </Routes>
            </Router>
          </div>
        );
      case "Admin":
        return (
          <div>
            <Router>
            <Navbar userType="Admin"></Navbar>
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/about" element={<About />} />
                <Route path="/account" element={<AccountSettings />} />
              </Routes>
            </Router>
          </div>
        );
      default:
        return <div>Access Denied</div>;
    }
  }

  return (
    //this is what is returned if a user is not signed in
    //routes should only go to pages that don't require authentication
    <div>
    <Router>
    <Navbar userType="Guest"></Navbar>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/account" element={<AccountSettings />} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
