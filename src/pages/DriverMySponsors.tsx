import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "react-oidc-context";
import "./HomeStyles.css";

//-------------------------------------
// Interfaces
//-------------------------------------
interface SponsorRecord {
  DriversEmail: string;
  DriversSponsorID: number;
  DriversPoints: number;
}

interface Organization {
  OrganizationID: number;
  OrganizationName: string;
}

//-------------------------------------
// Main Component
//-------------------------------------
export const DriverMySponsors: React.FC = () => {
  const authContext = useContext(AuthContext);
  const storedImpersonation = localStorage.getItem("impersonatingDriver");
  const impersonation = storedImpersonation
    ? JSON.parse(storedImpersonation)
    : null;

  const userEmail = impersonation
    ? impersonation.email
    : authContext?.user?.profile?.email || "";

  const [sponsors, setSponsors] = useState<SponsorRecord[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgsLoaded, setOrgsLoaded] = useState(false);

  const orgApiUrl = "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1/organizations";
  const sponsorApiUrl = "https://vnduk955ek.execute-api.us-east-1.amazonaws.com/dev1";

  //-------------------------------------
  // Fetch Organizations
  //-------------------------------------
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch(`${orgApiUrl}`);
        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error("Unexpected orgs format:", data);
          return;
        }
        setOrganizations(data);
        setOrgsLoaded(true);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    fetchOrganizations();
  }, []);

  //-------------------------------------
  // Fetch Driver’s Sponsors
  //-------------------------------------
  useEffect(() => {
    console.log("Using userEmail:", userEmail);

    if (!userEmail || !orgsLoaded) return;

    const fetchSponsors = async () => {
      try {
        const response = await fetch(`${sponsorApiUrl}/driverssponsors?DriversEmail=${encodeURIComponent(userEmail)}`);
        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error("Unexpected sponsors format:", data);
          return;
        }

        setSponsors(data);
      } catch (error) {
        console.error("Error fetching sponsors:", error);
      }
    };

    fetchSponsors();
  }, [userEmail, orgsLoaded]);

  //-------------------------------------
  // Remove a Sponsor
  //-------------------------------------
  const handleRemoveSponsor = async (sponsorID: number) => {
    try {
      const response = await fetch(
        `${sponsorApiUrl}/driverssponsor?DriversEmail=${encodeURIComponent(userEmail)}&DriversSponsorID=${sponsorID}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to remove sponsor. Status: ${response.status}`);
      }

      console.log("Sponsor removed successfully!");
      setSponsors((prev) =>
        prev.filter((s) => s.DriversSponsorID !== sponsorID)
      );
    } catch (error) {
      console.error("Error removing sponsor:", error);
    }
  };

  //-------------------------------------
  // Render
  //-------------------------------------
  return (
    <div className="container mt-4">
      <h2>My Sponsors</h2>

      {sponsors.length === 0 ? (
        <p>No sponsors found.</p>
      ) : (
        <div className="applications-container">
          {sponsors.map((sponsor) => {
            const org = organizations.find(
              (org) => org.OrganizationID === sponsor.DriversSponsorID
            );
            return (
              <div key={sponsor.DriversSponsorID} className="application-card">
                <p>
                  <strong>Organization:</strong>{" "}
                  {org ? org.OrganizationName : "Unknown Organization"}
                </p>
                <p>
                  <strong>Points:</strong> {sponsor.DriversPoints}
                </p>
                <button
                  className="btn btn-danger cancel-button"
                  onClick={() => handleRemoveSponsor(sponsor.DriversSponsorID)}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
