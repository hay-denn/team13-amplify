import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import "./HomeStyles.css";
import { TopBox } from "../components/TopBox/TopBox";
import { CatalogPreview } from "../components/CatalogPreview/CatalogPreview";
import "bootstrap/dist/css/bootstrap.min.css";
import CarouselTemplate from "../components/WelcomeImages";
import { SponsorApplyModal } from "../components/Modal";
import { AuthContext } from "react-oidc-context";
import { AvgPointAvgPurchase } from "../components/DriverBoxes/AvgPointAvgPurchase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const d = new Date(payload.value);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#000000"
        transform="rotate(-45)"
      >
        {`${month}/${year}`}
      </text>
    </g>
  );
};

interface OrganizationData {
  OrganizationID: number;
  OrganizationName: string;
  SearchTerm: string;
}

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
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [_, setOrganizationsLoaded] = useState(false);

  const driverRelationshipURL =
    "https://obf2ta0gw9.execute-api.us-east-1.amazonaws.com/dev1";

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

  const [pointChanges, setPointChanges] = useState<
    {
      PointChangeID: number;
      PointChangeDriver: string;
      PointChangeSponsor: string;
      PointChangeNumber: number;
      PointChangeAction: string;
      PointChangeDate: string;
      PointChangeReason: string;
      organizationID: number;
    }[]
  >([]);
  const POINT_CHANGE_API =
    "https://kco45spzej.execute-api.us-east-1.amazonaws.com/dev1";

  useEffect(() => {
    const getPointChanges = async () => {
      try {
        const response = await fetch(`${POINT_CHANGE_API}/pointchanges`);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        setPointChanges(data);
      } catch (error) {
        console.error("Error getting the driver's relationships:", error);
      }
    };

    getPointChanges();
  }, []);

  const driverPointChanges = pointChanges
    .filter((change) => change.PointChangeDriver === userEmail)
    .filter((change) => change.organizationID === selectedOrganizationID)

  const cumulativeData = driverPointChanges.map((cur, idx) => {
    // sum of all deltas up to and including this one
    const sumSoFar = driverPointChanges
      .slice(0, idx + 1)
      .reduce((acc, cur) => acc + Number(cur.PointChangeNumber), 0);
  
    return {
      ...cur,
      cumulativePoints: parseFloat(sumSoFar.toFixed(2)),
    };
  });

  console.log("cumulativeData:", cumulativeData);

  
  const handleOrganizationChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedOrganizationID(Number(event.target.value));
  };

  const selectedOrgData = organizations.find(
    (o) => o.OrganizationID === selectedOrganizationID
  );

  return (
    <>
      <div className="container manage-users-container py-5 m-1">
        <h1 className="welcome-message">Welcome Back, {userFName}!</h1>
        {organizationsDoneLoading ? (
          filteredOrganizations.length > 0 ? (
            // If the driver is part of at least one sponsor org
            <div className="container">
              <div className="row">
                <div className="col-md-4 d-flex">
                  <div
                    className="box topBoxContainer flex-fill d-flex flex-column"
                    style={{ height: "500px", overflow: "hidden" }}
                  >
                    <div style={{ flex: 1, overflowY: "auto" }}>
                      <TopBox />
                    </div>
                  </div>
                </div>

                <div className="col-md-8 d-flex">
                  <div
                    className="box box2 flex-fill d-flex flex-column"
                    style={{ height: "500px" }}
                  >
                    <h2>
                      Current Point Balance:{" "}
                      {selectedOrganization?.DriversPoints || "N/A"}
                    </h2>
                    <br />
                    <div className="d-flex align-items-center">
                      <label htmlFor="organizationDropdown" className="mr-2">
                        Select Organization:
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
                    </div>
                    {/* Recent Point Changes Table */}
                    <div
                      className="mt-4"
                      style={{ flex: 1, overflowY: "auto" }}
                    >
                      <h4>Recent Point Changes</h4>
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Point Change Date</th>
                            <th>Point Change Sponsor</th>
                            <th>Point Change Amount</th>
                            <th>Point Change Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pointChanges
                            .filter(
                              (change) => change.PointChangeDriver === userEmail
                            )
                            .filter(
                              (change) =>
                                change.organizationID === selectedOrganizationID
                            )
                            .reverse()
                            .slice(0, 5)
                            .map((change) => (
                              <tr key={change.PointChangeID}>
                                <td>
                                  {
                                    change.PointChangeDate
                                  }
                                </td>
                                <td>{change.PointChangeSponsor}</td>
                                <td>{change.PointChangeNumber}</td>
                                <td>{change.PointChangeReason}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4">
                      <Link
                        to="/myapplications"
                        className="btn btn-primary mr-2"
                      >
                        My Applications
                      </Link>
                      <Link to="/mysponsors" className="btn btn-primary">
                        My Sponsors
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mt-3">
                <div
                  className="col-md-4"
                  style={{ height: "500px", overflow: "hidden" }}
                >
                  <div className="box box3">
                    <CatalogPreview
                      searchTerm={selectedOrgData?.SearchTerm || ""}
                    />
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="box box5" style={{ overflow: "visible" }}>
                    <h4>Point Progress Chart</h4>
                    <div
                      style={{
                        width: "100%",
                        height: "450px",
                        overflow: "visible",
                      }}
                    >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={cumulativeData}
                        margin={{ top: 50, right: 70, left: 10, bottom: 70 }}
                      >
                        <XAxis
                          dataKey="PointChangeDate"
                          tick={<CustomXAxisTick />}
                          interval="preserveStartEnd"
                          minTickGap={20}
                          tickMargin={15}
                        />
                        {/* remove your manual domain so it auto‑fits the cumulative range */}
                        <YAxis tick={{ fill: "#000" }} />
                        <Tooltip
                          labelFormatter={(label) => {
                            const d = new Date(label);
                            return [d.getMonth()+1, d.getDate(), d.getFullYear()]
                              .map(n => String(n).padStart(2, '0'))
                              .join('/');
                          }}
                          contentStyle={{ color: "#000" }}
                          labelStyle={{ color: "#000" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="cumulativePoints"
                          stroke="#000"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>

                    </div>
                    <div>
                      <AvgPointAvgPurchase
                        SponsorEmail={userEmail}
                      ></AvgPointAvgPurchase>
                    </div>
                  </div>
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
                      className="btn btn-primary"
                      style={{ marginRight: "1rem" }}
                    >
                      My Applications
                    </Link>
                    <Link to="/mysponsors" className="btn btn-primary">
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
      </div>
    </>
  );
};
