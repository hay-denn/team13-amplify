import { useState, useContext, useEffect } from "react";
import "./HomeStyles.css";
import { TopBox } from "../components/TopBox/TopBox";
import "bootstrap/dist/css/bootstrap.min.css";
import CarouselTemplate from "../components/WelcomeImages";
import { SponsorApplyModal } from "../components/Modal";
import { AuthContext } from "react-oidc-context";



export const DriverDashBoard = () => {
  const authContext = useContext(AuthContext);
  const storedImpersonation = localStorage.getItem("impersonatingDriver");
  const impersonation = storedImpersonation ? JSON.parse(storedImpersonation) : null;
  const userEmail = impersonation ? impersonation.email : authContext?.user?.profile?.email || "";
  const userFName = impersonation ? impersonation.firstName : authContext?.user?.profile?.given_name || "";
  console.log("Current Driver Email: ", userEmail);
  console.log("Current Driver First Name: ", userFName);
  const [showModal, setShowModal] = useState(false);

  //The list of sponsors the driver is a part of
  const [currentOrganizations, setCurrentOrganizations] = useState<{ DriversEmail: string; DriversSponsorID: number; DriversPoints: number }[]>([]);
  

  interface Application {
    ApplicationID: number;
    ApplicationDriver: string;
    ApplicationOrganization: number;
    ApplicationSponsorUser: string | null;
    ApplicationStatus: string;
    ApplicationDateSubmitted: string;
    OrganizationName?: string;
  }

  const [applications, setApplications] = useState<Application[]>([]);
  const [sponsors, setSponsors] = useState<Application[]>([]);
  const [organizations, setOrganizations] = useState<
    { OrganizationID: number; OrganizationName: string }[]
  >([]);
  const [organizationsLoaded, setOrganizationsLoaded] = useState(false);
  const [sponsorNames, setSponsorNames] = useState<{ [key: string]: string }>(
    {}
  );

  const driverRelationshipURL =
    "https://vnduk955ek.execute-api.us-east-1.amazonaws.com/dev1";

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (userEmail) {
      getDriverRelationships();
    }
  }, [userEmail]);

  useEffect(() => {
    if (userEmail && organizationsLoaded) {
      fetchApplications();
    }
  }, [userEmail, organizationsLoaded]);

  const fetchOrganizations = async (): Promise<void> => {
    try {
      const response = await fetch(
        "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1/organizations"
      );
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

  const getDriverRelationships = async () => {
    try {
      const response = await fetch(
        `${driverRelationshipURL}/driverssponsors?DriversEmail=${encodeURIComponent(
          userEmail
        )}`
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setCurrentOrganizations(data);
    } catch (error) {
      console.error("Error getting the driver's relationships:", error);
    }
  };

  const fetchApplications = async (): Promise<void> => {
    try {
      const response = await fetch(
        `https://2ml4i1kz7j.execute-api.us-east-1.amazonaws.com/dev1/driversponsorapplications?ApplicationDriver=${encodeURIComponent(
          userEmail
        )}`
      );
      const data = (await response.json()) as Application[];

      if (!Array.isArray(data)) {
        console.error("Unexpected response format:", data);
        return;
      }

      const applicationsWithOrgNames = data.map((app) => {
        const org = organizations.find(
          (org) => org.OrganizationID === app.ApplicationOrganization
        );
        return {
          ...app,
          OrganizationName: org ? org.OrganizationName : "Unknown Organization",
        };
      });

      const sponsorsList = applicationsWithOrgNames.filter(
        (app) => app.ApplicationStatus.toLowerCase() === "approved"
      );
      sponsorsList.forEach((sponsor) => {
        if (sponsor.ApplicationSponsorUser) {
          sponsorNames[sponsor.ApplicationSponsorUser] =
            sponsor.ApplicationSponsorUser;
        }
      });

      setApplications(applicationsWithOrgNames);
      setSponsors(
        applicationsWithOrgNames.filter(
          (app) => app.ApplicationStatus.toLowerCase() === "approved"
        )
      );
      setSponsorNames(sponsorNames);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const handleCancelApplication = async (applicationID: number) => {
    try {
      const response = await fetch(
        "https://2ml4i1kz7j.execute-api.us-east-1.amazonaws.com/dev1/driversponsorapplication",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ApplicationID: applicationID }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete application. Status: ${response.status}`
        );
      }

      console.log("Application deleted successfully!");
      await fetchApplications();
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const handleRemoveSponsor = async (applicationID: number) => {
    try {
      const response = await fetch(
        "https://2ml4i1kz7j.execute-api.us-east-1.amazonaws.com/dev1/driversponsorapplication",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ApplicationID: applicationID }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to remove sponsor. Status: ${response.status}`);
      }

      console.log("Sponsor removed successfully!");
      await fetchApplications();
    } catch (error) {
      console.error("Error removing sponsor:", error);
    }
  };

  const [selectedOrganizationID, setSelectedOrganizationID] = useState<number | null>(
    currentOrganizations.length > 0 ? currentOrganizations[0].DriversSponsorID : null
  );
  
  const handleOrganizationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOrganizationID(Number(event.target.value));
  };
  
  const selectedOrganization = currentOrganizations.find(
    (org) => org.DriversSponsorID === selectedOrganizationID
  );
  

  return (
    <>
      <h1 className="welcome">Good Afternoon, {userFName}!</h1>

      {currentOrganizations.length > 0 ? (
        <div className="home">
          <div className="box box1">
            <TopBox />
          </div>
          <div className="box box2">
            {currentOrganizations.length > 0 && (
              <>
                <b>Current Point Balance: {selectedOrganization?.DriversPoints || "N/A"}</b>
                <br />
                <label htmlFor="organizationDropdown">Select Organization: </label>
                <select
                  id="organizationDropdown"
                  className="form-control"
                  value={selectedOrganizationID || ""}
                  onChange={handleOrganizationChange}
                >
                  <option value="" disabled>Select an Organization</option>
                  {currentOrganizations.map((org) => {
                    const organization = organizations.find(
                      (o) => o.OrganizationID === org.DriversSponsorID
                    );
                    return (
                      <option key={org.DriversSponsorID} value={org.DriversSponsorID}>
                        {organization ? organization.OrganizationName : "Unknown Organization"}
                      </option>
                    );
                  })}
                </select>
              </>
            )}
          </div>
          <div className="box box3">Placeholder Item</div>
          <div className="box box4">Placeholder Item</div>
          <div className="box box5">My Point Progress Chart:</div>
        </div>
      ) : (
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-5 left-col">
              <h2>Next Steps:</h2>
              <p>
                Now that you have completed registration as a driver, it is time
                for you to start applying to a sponsor of your choice.
              </p>
              <button
                className="btn btn-primary mb-3"
                onClick={() => setShowModal(true)}
              >
                Apply Now!
              </button>

              <div className="applications-container">
                <h2>My Applications</h2>
                {applications.length === 0 ? (
                  <p>No applications found.</p>
                ) : (
                  applications.map((app) => (
                    <div key={app.ApplicationID} className="application-card">
                      <span className="application-date">
                        {app.ApplicationDateSubmitted
                          ? new Date(
                              app.ApplicationDateSubmitted
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </span>
                      <span
                        className={`application-status ${app.ApplicationStatus.toLowerCase()}`}
                      >
                        {app.ApplicationStatus}
                      </span>
                      <p>{app.OrganizationName || "N/A"}</p>
                      {app.ApplicationStatus.toLowerCase() === "submitted" && (
                        <button
                          className="btn btn-danger cancel-button"
                          onClick={() =>
                            handleCancelApplication(app.ApplicationID)
                          }
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="applications-container">
                <h2>My Sponsors</h2>
                {sponsors.length === 0 ? (
                  <p>No sponsors found.</p>
                ) : (
                  sponsors.map((sponsor) => (
                    <div
                      key={sponsor.ApplicationID}
                      className="application-card"
                    >
                      <span className="application-date">
                        {sponsor.ApplicationDateSubmitted
                          ? new Date(
                              sponsor.ApplicationDateSubmitted
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </span>
                      <p>
                        {sponsor.ApplicationSponsorUser
                          ? sponsorNames[sponsor.ApplicationSponsorUser] ||
                            sponsor.ApplicationSponsorUser
                          : "N/A"}
                      </p>
                      <button
                        className="btn btn-danger cancel-button"
                        onClick={() =>
                          handleRemoveSponsor(sponsor.ApplicationID)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="col-md-7 right-col">
              <CarouselTemplate />
            </div>
          </div>
        </div>
      )}

      <SponsorApplyModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        driverEmail={userEmail}
        fetchApplications={fetchApplications}
      />
    </>
  );
};
