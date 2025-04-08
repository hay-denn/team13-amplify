import { useState, useEffect } from "react";
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
  OrganizationName?: string;
}

interface Organization {
  OrganizationID: number;
  OrganizationName: string;
}

interface DriverMyApplicationsProps {
  inputUserEmail: string; 
}


//-------------------------------------
// Main Component
//-------------------------------------
export const DriverMyApplications = (inputUserEmail: DriverMyApplicationsProps) => {

	const storedImpersonation = localStorage.getItem("impersonatingDriver");
  const impersonation = storedImpersonation
    ? JSON.parse(storedImpersonation)
    : null;

	const userEmail = impersonation
    ? impersonation.email
    : inputUserEmail.inputUserEmail || "";


  const [applications, setApplications] = useState<Application[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationsLoaded, setOrganizationsLoaded] = useState(false);

  const orgApiUrl = "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1/organizations";
  const appsApiUrl =
    "https://2ml4i1kz7j.execute-api.us-east-1.amazonaws.com/dev1";

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
        setOrganizationsLoaded(true);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    fetchOrganizations();
  }, []);

  //-------------------------------------
  // Fetch Driver Applications
  //-------------------------------------
  useEffect(() => {
    if (!userEmail || !organizationsLoaded) return;

    const getDriverApplications = async () => {
      try {
        const response = await fetch(
          `${appsApiUrl}/driversponsorapplications?ApplicationDriver=${encodeURIComponent(userEmail)}`
        );
        const data = (await response.json()) as Application[];

        if (!Array.isArray(data)) {
          console.error("Unexpected response format:", data);
          return;
        }

        // Combine with organization names
        const appsWithOrgNames = data.map((app) => {
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

        setApplications(appsWithOrgNames);
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };

    getDriverApplications();
  }, [userEmail, organizationsLoaded, organizations]);

  //-------------------------------------
  // Cancel an Application
  //-------------------------------------
  const handleCancelApplication = async (applicationID: number) => {
    console.log("Cancel button clicked for ID:", applicationID); // 👈 Add this

    try {
      const response = await fetch(
        `${appsApiUrl}/driversponsorapplication?ApplicationID=${applicationID}`,
        {
          method: "DELETE",
        }
      );
  
      if (!response.ok) {
        throw new Error(`Failed to cancel application. Status: ${response.status}`);
      }
  
      console.log("Application canceled successfully!");
      setApplications((prev) =>
        prev.filter((app) => app.ApplicationID !== applicationID)
      );
    } catch (error) {
      console.error("Error canceling application:", error);
    }
  };
  

  //-------------------------------------
  // Render
  //-------------------------------------
  return (
    <div className="container mt-4">
      <h2>My Applications</h2>

      {applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        <div className="applications-container">
          {applications.map((app) => (
            <div key={app.ApplicationID} className="application-card">
              {/* Date submitted */}
              <span className="application-date">
                {app.ApplicationDateSubmitted
                  ? new Date(app.ApplicationDateSubmitted).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A"}
              </span>

              {/* Current status (e.g., "Submitted") */}
              <span className={`application-status ${app.ApplicationStatus.toLowerCase()}`}>
                {app.ApplicationStatus}
              </span>

              {/* Organization name */}
              <p>{app.OrganizationName || "Unknown Organization"}</p>

              {/* "Cancel" button only if status is "Submitted" */}
              {app.ApplicationStatus.toLowerCase() === "submitted" && (
                <button
                  className="btn btn-danger cancel-button"
                  onClick={() => handleCancelApplication(app.ApplicationID)}
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
