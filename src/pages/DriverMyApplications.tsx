import { useState, useEffect } from "react";
import "./HomeStyles.css";
import "./DriverMyApplications.css";

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
  ApplicationDecisionReason: string | null;
  ApplicationReason: string | null;
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
  const impersonation = storedImpersonation ? JSON.parse(storedImpersonation) : null;

  const userEmail = impersonation
    ? impersonation.email
    : inputUserEmail.inputUserEmail || "";

  const [applications, setApplications] = useState<Application[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationsLoaded, setOrganizationsLoaded] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const applicationsPerPage = 5;

  const orgApiUrl = "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1/organizations";
  const appsApiUrl = "https://2ml4i1kz7j.execute-api.us-east-1.amazonaws.com/dev1";

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
        setCurrentPage(1); // Reset to first page when data is fetched
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
    console.log("Cancel button clicked for ID:", applicationID);

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
      setApplications((prev) => prev.filter((app) => app.ApplicationID !== applicationID));
    } catch (error) {
      console.error("Error canceling application:", error);
    }
  };

  //-------------------------------------
  // Pagination Logic
  //-------------------------------------
  const indexOfLastApp = currentPage * applicationsPerPage;
  const indexOfFirstApp = indexOfLastApp - applicationsPerPage;
  const currentApplications = applications.slice(indexOfFirstApp, indexOfLastApp);
  const totalPages = Math.ceil(applications.length / applicationsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
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
        <>
          <div className="applications-container">
            {currentApplications.map((app) => (
              <div key={app.ApplicationID} className="application-card">
                <span className="application-date">
                  {app.ApplicationDateSubmitted
                    ? new Date(app.ApplicationDateSubmitted).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </span>

                <span className={`application-status ${app.ApplicationStatus.toLowerCase()}`}>
                  {app.ApplicationStatus}
                </span>

                <p>{app.OrganizationName || "Unknown Organization"}</p>

                <p>
                  {app.ApplicationStatus.toLowerCase() !== "submitted" && (
                    <>
                      <strong>Application Decision Reason:</strong>
                      {app.ApplicationDecisionReason || " No reason provided."}
                    </>
                  )}
                </p>

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

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button onClick={handlePrevPage} disabled={currentPage === 1}>
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
