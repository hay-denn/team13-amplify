import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "react-oidc-context";
import "./HomeStyles.css";

//-------------------------------------
// Interfaces
//-------------------------------------
interface Application {
  ApplicationID: number;
  ApplicationDriver: string;
  ApplicationOrganization: number;
  ApplicationSponsorUser: string | null;
  ApplicationStatus: string;
  ApplicationDateSubmitted: string;
  OrganizationName?: string; // We'll add this after fetching org details
}

interface Organization {
  OrganizationID: number;
  OrganizationName: string;
}

//-------------------------------------
// Main Component
//-------------------------------------
export const DriverMySponsors: React.FC = () => {
  // 1) Determine current user's email
  const authContext = useContext(AuthContext);
  const storedImpersonation = localStorage.getItem("impersonatingDriver");
  const impersonation = storedImpersonation
    ? JSON.parse(storedImpersonation)
    : null;

  // If impersonating, use that email, otherwise use the AuthContext
  const userEmail = impersonation
    ? impersonation.email
    : authContext?.user?.profile?.email || "";

  // 2) Local state for the "approved" sponsor applications & organizations
  const [sponsors, setSponsors] = useState<Application[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgsLoaded, setOrgsLoaded] = useState(false);

  // 3) Endpoint URLs
  const orgApiUrl = "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1/organizations";
  const appsApiUrl =
    "https://2ml4i1kz7j.execute-api.us-east-1.amazonaws.com/dev1/driversponsorapplications";

  //-------------------------------------
  // Fetch Organizations
  //-------------------------------------
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch(orgApiUrl);
        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error("Unexpected response format:", data);
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
  // Fetch "Approved" Sponsor Applications
  //-------------------------------------
  useEffect(() => {
    if (!userEmail || !orgsLoaded) return;

    const fetchSponsors = async () => {
      try {
        // GET all applications for this driver
        const response = await fetch(
          `${appsApiUrl}?ApplicationDriver=${encodeURIComponent(userEmail)}`
        );
        const data = (await response.json()) as Application[];

        if (!Array.isArray(data)) {
          console.error("Unexpected response format:", data);
          return;
        }

        // Filter for those with ApplicationStatus === "Approved"
        const approvedApps = data.filter(
          (app) => app.ApplicationStatus.toLowerCase() === "approved"
        );

        // Add organization names
        const sponsorsWithOrgNames = approvedApps.map((app) => {
          const matchingOrg = organizations.find(
            (org) => org.OrganizationID === app.ApplicationOrganization
          );
          return {
            ...app,
            OrganizationName: matchingOrg
              ? matchingOrg.OrganizationName
              : "Unknown Organization",
          };
        });

        setSponsors(sponsorsWithOrgNames);
      } catch (error) {
        console.error("Error fetching sponsors:", error);
      }
    };

    fetchSponsors();
  }, [userEmail, orgsLoaded, organizations]);

  //-------------------------------------
  // Remove a Sponsor (i.e., remove an approved application)
  //-------------------------------------
  const handleRemoveSponsor = async (applicationID: number) => {
    try {
      const response = await fetch(appsApiUrl, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ApplicationID: applicationID }),
      });

      if (!response.ok) {
        throw new Error(`Failed to remove sponsor. Status: ${response.status}`);
      }

      console.log("Sponsor removed successfully!");
      // Filter out the removed sponsor from local state
      setSponsors((prev) =>
        prev.filter((app) => app.ApplicationID !== applicationID)
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
          {sponsors.map((sponsor) => (
            <div key={sponsor.ApplicationID} className="application-card">
              <span className="application-date">
                {sponsor.ApplicationDateSubmitted
                  ? new Date(sponsor.ApplicationDateSubmitted).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A"}
              </span>
              <p>
                <strong>Organization:</strong>{" "}
                {sponsor.OrganizationName || "Unknown Organization"}
              </p>
              <p>
                <strong>Sponsor User:</strong>{" "}
                {sponsor.ApplicationSponsorUser || "N/A"}
              </p>

              <button
                className="btn btn-danger cancel-button"
                onClick={() => handleRemoveSponsor(sponsor.ApplicationID)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
