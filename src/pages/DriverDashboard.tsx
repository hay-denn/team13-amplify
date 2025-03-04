import { useState, useContext, useEffect } from "react";
import "./HomeStyles.css";
import { TopBox } from "../components/TopBox/TopBox";
import "bootstrap/dist/css/bootstrap.min.css";
import CarouselTemplate from "../components/WelcomeImages";
import { SponsorApplyModal } from "../components/Modal";
import { AuthContext } from "react-oidc-context";

interface Props {
  userFName?: string;
  companyName?: string;
}

export const DriverDashBoard = ({ companyName }: Props) => {
  const authContext = useContext(AuthContext);
  const userFName = authContext?.user?.profile?.given_name || "";
  const userEmail = authContext?.user?.profile?.email || "";
  const [showModal, setShowModal] = useState(false);

  interface Application {
    ApplicationID: number;
    ApplicationDriver: string;
    ApplicationOrganization: number;
    ApplicationSponsorUser: string | null;
    ApplicationStatus: string;
    ApplicationDateSubmitted: string;
  }

  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (userEmail) {
      fetchApplications();
    }
  }, [userEmail]);

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

      setApplications(data);
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
        throw new Error(`Failed to delete application. Status: ${response.status}`);
      }
  
      console.log("Application deleted successfully!");
      await fetchApplications();
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  return (
    <>
      <h1 className="welcome">Good Afternoon, {userFName}!</h1>

      {companyName ? (
        <div className="home">
          <div className="box box1">
            <TopBox />
          </div>
          <div className="box box2">
            <b>Current Point Balance</b>
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
                      <p>
                        {app.ApplicationSponsorUser || "N/A"} |{" "}
                        {app.ApplicationOrganization}
                      </p>
                      {app.ApplicationStatus?.trim().toLowerCase() === "submitted" && (
                        <button
                          className="btn btn-danger cancel-button"
                          onClick={() => handleCancelApplication(app.ApplicationID)}
                        >
                          Cancel
                        </button>
                      )}
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