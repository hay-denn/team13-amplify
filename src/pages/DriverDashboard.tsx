import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import "./HomeStyles.css";
import { TopBox } from "../components/TopBox/TopBox";
import "bootstrap/dist/css/bootstrap.min.css";
import CarouselTemplate from "../components/WelcomeImages";
import { SponsorApplyModal } from "../components/Modal";
import { AuthContext } from "react-oidc-context";

export const DriverDashBoard = () => {
  //Auth & Impersonation
  const authContext = useContext(AuthContext);
  const storedImpersonation = localStorage.getItem("impersonatingDriver");
  const impersonation = storedImpersonation
    ? JSON.parse(storedImpersonation)
    : null;

  const [organizationsDoneLoading, setorganizationsDoneLoading] =
    useState(false);
  const userEmail = impersonation
    ? impersonation.email
    : authContext?.user?.profile?.email || "";

  const userFName = impersonation
    ? impersonation.firstName
    : authContext?.user?.profile?.given_name || "";

  const [showModal, setShowModal] = useState(false);

  // Driver-sponsor relationships (for point balance and selected org)
  const [currentOrganizations, setCurrentOrganizations] = useState<
    { DriversEmail: string; DriversSponsorID: number; DriversPoints: number }[]
  >([]);

  // Filter organizations if we're impersonating for a specific sponsor
  const filteredOrganizations = impersonation?.sponsorOrgID
    ? currentOrganizations.filter(
        (org) => org.DriversSponsorID === Number(impersonation.sponsorOrgID)
      )
    : currentOrganizations;

  const [selectedOrganizationID, setSelectedOrganizationID] = useState<
    number | null
  >(null);

  // Handle initial selection once filtered orgs load
  useEffect(() => {
    if (filteredOrganizations.length > 0 && selectedOrganizationID === null) {
      setSelectedOrganizationID(filteredOrganizations[0].DriversSponsorID);
    }
  }, [filteredOrganizations, selectedOrganizationID]);

  const selectedOrganization = filteredOrganizations.find(
    (org) => org.DriversSponsorID === selectedOrganizationID
  );

  //Fetch all organizations (so we can display org name) and the driver's relationships
  const [organizations, setOrganizations] = useState<
    { OrganizationID: number; OrganizationName: string }[]
  >([]);
  const [_, setOrganizationsLoaded] = useState(false);

  const driverRelationshipURL =
    "https://vnduk955ek.execute-api.us-east-1.amazonaws.com/dev1";

  // Fetch the organization list
  useEffect(() => {
    const fetchOrganizations = async (): Promise<void> => {
      try {
        const response = await fetch(
          "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1/organizations"
        );
        const data = await response.json();
        setorganizationsDoneLoading(true);
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

  // Fetch this driver's sponsor relationships (for points + org selection)
  useEffect(() => {
    const getDriverRelationships = async () => {
      if (!userEmail) return;
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

    getDriverRelationships();
  }, [userEmail]);

  const handleOrganizationChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedOrganizationID(Number(event.target.value));
  };

  return (
    <>
      <h1 className="text-center mb-5 mt-5">Welcome Back {userFName}!</h1>
      {organizationsDoneLoading ? (
        filteredOrganizations.length > 0 ? (
          // If the driver is part of at least one sponsor org
          <div className="container">
            {/* Top row: left box + selected org info */}
            <div className="row">
              <div className="col-md-4">
                <div className="box box1">
                  <TopBox />
                </div>
              </div>
              <div className="col-md-8">
                <div className="box box2">
                  <b>
                    Current Point Balance:{" "}
                    {selectedOrganization?.DriversPoints || "N/A"}
                  </b>
                  <br />
                  <label htmlFor="organizationDropdown">
                    Select Organization:{" "}
                  </label>
                  <select
                    id="organizationDropdown"
                    className="form-control"
                    value={selectedOrganizationID || ""}
                    onChange={handleOrganizationChange}
                  >
                    <option value="" disabled>
                      Select an Organization
                    </option>
                    {filteredOrganizations.map((org) => {
                      const orgInfo = organizations.find(
                        (o) => o.OrganizationID === org.DriversSponsorID
                      );
                      return (
                        <option
                          key={org.DriversSponsorID}
                          value={org.DriversSponsorID}
                        >
                          {orgInfo
                            ? orgInfo.OrganizationName
                            : "Unknown Organization"}
                        </option>
                      );
                    })}
                  </select>

                  {/* LINKS to My Applications and My Sponsors */}
                  <div className="mt-4">
                    <Link
                      to="/myapplications"
                      className="btn btn-secondary mr-2"
                    >
                      My Applications
                    </Link>
                    <Link to="/mysponsors" className="btn btn-secondary">
                      My Sponsors
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Placeholder rows/items */}
            <div className="row mt-3">
              <div className="col-md-4">
                <div className="box box3">Placeholder Item</div>
              </div>
              <div className="col-md-4">
                <div className="box box4">Placeholder Item</div>
              </div>
              <div className="col-md-4">
                <div className="box box5">My Point Progress Chart:</div>
              </div>
            </div>
          </div>
        ) : (
          // If the driver has no sponsor relationships yet
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col-md-5 left-col">
                <h2>Next Steps:</h2>
                <p>
                  Now that you have completed registration as a driver, it is
                  time for you to start applying to a sponsor of your choice.
                </p>
                <button
                  className="btn btn-primary mb-3"
                  onClick={() => setShowModal(true)}
                >
                  Apply Now!
                </button>

                <div style={{ marginTop: "1rem" }}>
                  <Link
                    to="/myapplications"
                    className="btn btn-secondary"
                    style={{ marginRight: "1rem" }}
                  >
                    My Applications
                  </Link>
                  <Link to="/mysponsors" className="btn btn-secondary">
                    My Sponsors
                  </Link>
                </div>
              </div>

              <div className="col-md-7 right-col">
                <CarouselTemplate />
              </div>
            </div>
          </div>
        )
      ) : (
        <div>Loading Organizations...</div>
      )}

      <SponsorApplyModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        driverEmail={userEmail}
        fetchApplications={() => {}}
      />
    </>
  );
};
