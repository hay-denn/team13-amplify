import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { Modal, Button, Dropdown } from "react-bootstrap";
import "./ListOfUsersTable.css"

import UserModal, { ViewOrgModal } from "./Modal";

interface Driver {
  DriverEmail: string;
  DriverFName: string;
  DriverLName: string;
  DriverSponsor: string;
  DriverPoints: string;
}

interface Sponsor {
  UserEmail: string;
  UserFName: string;
  UserLName: string;
  UserOrganization: string;
}

interface Admin {
  AdminEmail: string;
  AdminFName: string;
  AdminLName: string;
}

interface Props {
  driverTable: Driver[];
  sponsorTable?: Sponsor[];
  adminTable?: Admin[];
  isSponsor?: boolean;
}

const SPONSOR_BASE_URL =
  "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1";

const driversponsor_url =
  "https://obf2ta0gw9.execute-api.us-east-1.amazonaws.com/dev1";

const organizations_url =
  "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

const sponsors_url =
  "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1";

export const ListOfUsersTable = ({
  driverTable,
  sponsorTable = [],
  adminTable = [],
  isSponsor = false,
}: Props) => {
  const auth = useAuth();
  const cognitoGroups: string[] =
  (auth.user?.profile?.["cognito:groups"] as string[]) || [];
  const userGroup = cognitoGroups[0];

  // Track organization for sponsor
  const [sponsorOrgID, setSponsorOrgID] = useState<string | null>(null);

  // For "ViewOrg" functionality
  const [isViewOrgModalOpen, setIsViewOrgModalOpen] = useState<boolean>(false);
  const [viewOrgEmail, setViewOrgEmail] = useState<string>("");

  // For the "Actions" modal (points, impersonation, etc.)
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [currentPoints, setCurrentPoints] = useState<number | null>(null);
  const [pointsChange, setPointsChange] = useState<number>(0);
  const [reason, setReason] = useState<string>("");

  // Corrected recurring points states:
  // recurringPoints holds the value fetched from the API (for display)
  const [recurringPoints, setRecurringPoints] = useState<number | null>(null);
  // recurringPointsEdit is used by the plus/minus controls to adjust value
  const [recurringPointsEdit, setRecurringPointsEdit] = useState<number>(0);

  // For the "Edit" modal (creating/updating user info)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  // Build a single list of all user emails for the modal’s validation
  const allEmails = [
    ...driverTable.map((d) => d.DriverEmail),
    ...sponsorTable.map((s) => s.UserEmail),
    ...adminTable.map((a) => a.AdminEmail),
  ];

  const [driverOrganizations, setDriverOrganizations] = useState<
  { id: string; name: string }[]
>([]);
  const [sponsorImpersonation, setSponsorImpersonation] = useState<string | null>(null);
  const [potentialImpersonationSponsors, setPotentialImpersonationSponsors] = useState<
  { UserEmail: string }[] | null>(null);

  const handleRemoveDriver = async (driverEmail: string) => {
    try {
      const response = await fetch(
        `${driversponsor_url}/driverssponsor?DriversEmail=${encodeURIComponent(
          driverEmail
        )}&DriversSponsorID=${encodeURIComponent(sponsorOrgID || "")}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
  
      if (!response.ok) {
        throw new Error(`Error removing driver: ${response.status}`);
      }
  
      alert("Driver removed successfully.");
      window.location.reload();
    } catch (error) {
      console.error("Failed to remove driver:", error);
      alert("Failed to remove driver.");
    }
  };  

  // =========================================
  // SPONSOR ORGANIZATION ID FETCH
  // =========================================
  useEffect(() => {
    const fetchSponsorOrg = async () => {
      try {
        const response = await fetch(
          `${SPONSOR_BASE_URL}/sponsor?UserEmail=${encodeURIComponent(
            auth.user?.profile?.email || ""
          )}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch sponsor: ${response.status}`);
        }
        const data = await response.json();
        let sponsor;
        if (Array.isArray(data)) {
          sponsor = data.find(
            (s: any) => s.UserEmail === auth.user?.profile?.email
          );
        } else {
          sponsor = data;
        }
        if (sponsor && sponsor.UserOrganization) {
          setSponsorOrgID(sponsor.UserOrganization);
        }
      } catch (err) {
        console.error("Error fetching sponsor organization:", err);
      }
    };

    if (auth.user?.profile?.email) {
      fetchSponsorOrg();
    }
  }, [auth.user?.profile?.email]);

  // =========================================
  // ACTIONS MODAL METHODS
  // =========================================
  const handleViewOrg = (pemail: string) => {
    setViewOrgEmail(pemail);
    setIsViewOrgModalOpen(true);
  };

  const handleShowActionsModal = async (user: any) => {
    setSelectedUser(user);
    setShowActionsModal(true);
  
    const email = user.DriverEmail || user.UserEmail;
    if (email) {
      const orgs = await fetchDriverOrganizations(email);
      setDriverOrganizations(orgs);
    }
    
  };
  

  const handleCloseActionsModal = () => {
    setShowActionsModal(false);
    setSelectedUser(null);
    setCurrentPoints(null);
    setPointsChange(0);
    setRecurringPointsEdit(0);
    setReason("");
    setDriverOrganizations([]);
    setRecurringPoints(null);
    setCurrentPoints(null);

    if (userGroup === "Admin") {
      setSponsorOrgID(null);
    }

    setSponsorImpersonation(null);
    setPotentialImpersonationSponsors(null);
  };
  

  const handleViewAsDriver = (targetRoute: string) => {
    if (!selectedUser) return;
    localStorage.setItem(
      "impersonatingDriver",
      JSON.stringify({
        email: selectedUser.DriverEmail,
        firstName: selectedUser.DriverFName,
        sponsorOrgID: sponsorOrgID,
      })
    );
    handleCloseActionsModal();
    window.open(targetRoute, "_blank");
  };

  const handleEditOrders = (targetRoute: string) => {
    if (!selectedUser) return;
    const currentSponsorEmail = auth.user?.profile?.email || "";
    localStorage.setItem(
      "driverEmailForEdit",
      JSON.stringify({
        driverEmail: selectedUser.DriverEmail,
        sponsorOrgID: sponsorOrgID,
        sponsorEmail: currentSponsorEmail,
      })
    );
    handleCloseActionsModal();
    window.open(targetRoute, "_blank");
  };

  const fetchCurrentPoints = async (driverEmail: string) => {
    try {
      const response = await fetch(
        `https://obf2ta0gw9.execute-api.us-east-1.amazonaws.com/dev1/driverssponsor?DriversEmail=${encodeURIComponent(
          driverEmail
        )}&DriversSponsorID=${encodeURIComponent(sponsorOrgID || "")}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setCurrentPoints(Number(data.DriversPoints));
    } catch (error) {
      console.error("Error fetching driver's points:", error);
      setCurrentPoints(null);
    }
  };

  // Updated fetch function for recurring points:
  // It sets both the API value and the editable value.
  const fetchRecurringPoints = async () => {
    try {
      const url = `https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1/dailypoints?OrganizationID=${encodeURIComponent(sponsorOrgID || "")}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      const fetched = Number(data.DailyPointChange);
      setRecurringPoints(fetched);
      setRecurringPointsEdit(fetched);
    } catch (error) {
      console.error("Error fetching recurring points:", error);
      setRecurringPoints(0);
      setRecurringPointsEdit(0);
    }
  };

  const fetchSponsorsInOrg = async (orgID: string) => {
    try {
      const response = await fetch(
        `${sponsors_url}/sponsors?UserOrganization=${encodeURIComponent(orgID)}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      const sponsors = data.map((sponsor: any) => ({
        UserEmail: sponsor.UserEmail,
      }));
      setPotentialImpersonationSponsors(sponsors);
      return sponsors;
    } catch (error) {
      console.error("Error fetching sponsors in organization:", error);
      return [];
    }
  };

  const fetchSponsorOrgName = async (sponsorOrgID: string) => {
    try {
      const response = await fetch(
        `${organizations_url}/organization?OrganizationID=${encodeURIComponent(sponsorOrgID)}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      const orgName = data?.OrganizationName || "Unknown Organization";
      return orgName;
    } catch (error) {
      console.error("Error fetching sponsor organization name:", error);
      return "N/A";
    }
  };

  const fetchDriverOrganizations = async (driverEmail: string) => {
    try {
      const response = await fetch(
        `https://obf2ta0gw9.execute-api.us-east-1.amazonaws.com/dev1/driverssponsors?DriversEmail=${encodeURIComponent(driverEmail)}`
      );
      if (response.status === 400 && (await response.json()).error === "Driver has no sponsors") {
        console.warn("Driver has no sponsors.");
        return [];
      }
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();

      const organizations = data.map((item: any) => item.DriversSponsorID);

      // Fetch the organization names for each ID
      const orgNamePromises = organizations.map((orgID: string) =>
        fetchSponsorOrgName(orgID)
      );
      const orgNames = await Promise.all(orgNamePromises);
      const organizationsWithNames = organizations.map((orgID: string, index: number) => ({
        id: orgID,
        name: orgNames[index],
      }));

      return organizationsWithNames;
    } catch (error) {
      console.error("Error fetching driver organizations:", error);
      return [];
    }
  };


  useEffect(() => {
    if (selectedUser && sponsorOrgID) {
      const driverEmail = selectedUser.DriverEmail || selectedUser.UserEmail;
      if (driverEmail) {
        fetchCurrentPoints(driverEmail);
        fetchRecurringPoints();
      }
    }
  }, [selectedUser, sponsorOrgID]);

  const handleChangePoints = async () => {
    if (pointsChange === 0) {
      alert("Please input a non-zero value to change points.");
      return;
    }
    console.log(reason);

    if (reason.trim() === "") {
      alert("Please provide a reason for the point change.");
      return;
    }

    if (userGroup === "Admin" && !sponsorOrgID) {
      alert("Please select an organization before changing points.");
      return;
    }
    if (userGroup === "Admin" && !sponsorImpersonation) {
      alert("Please select a sponsor email before changing points.");
      return;
    }
    
    const driverEmail = selectedUser.DriverEmail || selectedUser.UserEmail;

    const sponsorEmail = userGroup === "Admin" && sponsorImpersonation 
      ? sponsorImpersonation 
      : auth.user?.profile?.email || "";

    console.log("Sponsor Email:", sponsorEmail);

    const action = pointsChange > 0 ? "Add" : "Subtract";
    try {
      const response = await fetch(
        "https://kco45spzej.execute-api.us-east-1.amazonaws.com/dev1/pointchange",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            PointChangeDriver: driverEmail.toString(),
            PointChangeSponsor: sponsorEmail.toString(),
            PointChangeNumber: pointsChange.toString(),
            PointChangeAction: action,
            PointChangeReason: reason
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      await fetchCurrentPoints(driverEmail);
      alert("Point change submitted successfully");
      setPointsChange(0);
    } catch (error) {
      console.error("Error changing points:", error);
      alert("Failed to change points.");
    }
  };

  const handleSetRecurringPoints = async () => {
    try {
      const response = await fetch(
        "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1/dailypoints",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            OrganizationID: sponsorOrgID,
            DailyPointChange: recurringPointsEdit,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      await fetchRecurringPoints(); // refresh after updating
      alert("Daily recurring points set successfully");
    } catch (error) {
      console.error("Error setting daily points:", error);
      alert("Failed to set daily points.");
    }
  };

  // =========================================
  // EDIT MODAL METHODS
  // =========================================
  const handleEditUser = (user: any, userType: string) => {
    // Build initial data for the edit modal
    let firstName = "";
    let familyName = "";
    let email = "";
    let org = "";

    if (userType === "Driver") {
      firstName = user.DriverFName;
      familyName = user.DriverLName;
      email = user.DriverEmail;
    } else if (userType === "Sponsor") {
      firstName = user.UserFName;
      familyName = user.UserLName;
      email = user.UserEmail;
      org = user.UserOrganization;
    } else if (userType === "Admin") {
      firstName = user.AdminFName;
      familyName = user.AdminLName;
      email = user.AdminEmail;
    }

    setEditData({
      firstName,
      familyName,
      email,
      userType,
      newUser: false,
      org,
    });

    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  useEffect(() => {
    if (userGroup === "Admin" && sponsorOrgID) {
      fetchSponsorsInOrg(sponsorOrgID);
      console.log("Fetching sponsors for org ID:", sponsorOrgID);
    }
  }, [sponsorOrgID]);
  

// =========================================
// RENDER
// =========================================
return (
  <div>
    {/* Container that centers and limits width */}
    <div className="custom-table-container">
      <table className="table table-striped table-bordered table-hover align-middle">
        <thead className="table-secondary">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Type</th>
            <th scope="col">First</th>
            <th scope="col">Last</th>
            <th scope="col">Email</th>
            {!isSponsor && <th scope="col">Organization</th>}
            {!isSponsor && <th scope="col">Edit</th>}
            <th scope="col">Actions</th>
            {isSponsor && <th scope="col">Remove</th>}
          </tr>
        </thead>
        <tbody>
          {driverTable.map((driver, index) => (
            <tr key={`driver-${index}`}>
              <th scope="row">{index + 1}</th>
              <td>Driver</td>
              <td>{driver.DriverFName}</td>
              <td>{driver.DriverLName}</td>
              <td>{driver.DriverEmail}</td>
              {!isSponsor && (
                <>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleViewOrg(driver.DriverEmail)}
                    >
                      View
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEditUser(driver, "Driver")}
                    >
                      Edit
                    </button>
                  </td>
                </>
              )}
              {isSponsor ? (
                <>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleShowActionsModal(driver)}
                    >
                      Actions
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRemoveDriver(driver.DriverEmail)}
                    >
                      Remove
                    </button>
                  </td>
                </>
              ) : (
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleShowActionsModal(driver)}
                  >
                    Actions
                  </button>
                </td>
              )}
            </tr>
          ))}

          {sponsorTable.map((sponsor, index) => (
            <tr key={`sponsor-${index}`}>
              <th scope="row">{driverTable.length + index + 1}</th>
              <td>Sponsor</td>
              <td>{sponsor.UserFName}</td>
              <td>{sponsor.UserLName}</td>
              <td>{sponsor.UserEmail}</td>
              {!isSponsor && <td>{sponsor.UserOrganization || "N / A"}</td>}
              {!isSponsor && (
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleEditUser(sponsor, "Sponsor")}
                  >
                    Edit
                  </button>
                </td>
              )}
              <td>
              </td>
              {isSponsor && <td></td>}
            </tr>
          ))}

          {adminTable.map((admin, index) => (
            <tr key={`admin-${index}`}>
              <th scope="row">
                {driverTable.length + sponsorTable.length + index + 1}
              </th>
              <td>Admin</td>
              <td>{admin.AdminFName}</td>
              <td>{admin.AdminLName}</td>
              <td>{admin.AdminEmail}</td>
              {!isSponsor && <td>Administrator</td>}
              {!isSponsor && (
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleEditUser(admin, "Admin")}
                  >
                    Edit
                  </button>
                </td>
              )}
              <td>
              </td>
              {isSponsor && <td></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* View Organization Modal */}
    <ViewOrgModal
      isOpen={isViewOrgModalOpen}
      onClose={() => setIsViewOrgModalOpen(false)}
      email={viewOrgEmail}
    />

    {/* Actions Modal (Points, Impersonation, etc.) */}
    <Modal
      show={showActionsModal}
      onHide={handleCloseActionsModal}
      size="lg"
      dialogClassName="my-centered-dialog"
    >
      <Modal.Header closeButton>
        <Modal.Title style={{ width: "100%", textAlign: "center" }}>
          Edit Driver
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedUser && (
          <>
            <p>
              <strong>User Email: </strong>
              {selectedUser.DriverEmail ||
                selectedUser.UserEmail ||
                "N / A"}
            </p>
            {userGroup === "Admin" && (
              <p>
              <strong>User Organization:</strong>
              <Dropdown>
              <Dropdown.Toggle
                className="btn btn-secondary dropdown-toggle"
                disabled={driverOrganizations.length === 0}
              >
                {driverOrganizations.length === 0
                  ? "No Organizations Found"
                  : driverOrganizations.find((org) => org.id === sponsorOrgID)?.name || "Select Organization"}
              </Dropdown.Toggle>
                <Dropdown.Menu>
                {driverOrganizations.map((org, index) => (
                  <Dropdown.Item key={index} onClick={() => setSponsorOrgID(org.id)}>
                    {org.name}
                  </Dropdown.Item>
                ))}
                </Dropdown.Menu>
              </Dropdown>
              </p>
            )}
            {userGroup === "Admin" && sponsorOrgID && (
              <p>
                <strong> Select Sponsor Email for Point Change</strong>
                <Dropdown>
                  <Dropdown.Toggle
                    className="btn btn-secondary dropdown-toggle"
                    disabled={driverOrganizations.length === 0}
                  >
                    {sponsorImpersonation || "Select Sponsor Email"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {potentialImpersonationSponsors?.map((sponsor, index) => (
                      <Dropdown.Item
                        key={index}
                        onClick={() => {
                          setSponsorImpersonation(sponsor.UserEmail);
                        }}
                      >
                        {sponsor.UserEmail}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </p>
            )}
            <p>
              <strong>User Points: </strong>
              {currentPoints !== null ? currentPoints : "Loading..."}
            </p>
            <p>
              <strong>Recurring Points: </strong>
              {recurringPoints !== null ? recurringPoints : "Loading..."}
            </p>

            {/* One-time point adjustment */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap"
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setPointsChange(pointsChange - 1)}
              >
                -
              </button>
              <span>{pointsChange}</span>
              <button
                className="btn btn-secondary"
                onClick={() => setPointsChange(pointsChange + 1)}
              >
                +
              </button>
              <button
                className="btn btn-primary"
                onClick={handleChangePoints}
              >
                Change Points
              </button>
            </div>

            {/* Reason for point change */}
            <div style={{ marginTop: "10px" }}>
              <label htmlFor="reason" style={{ fontWeight: "bold" }}>
                Reason for Point Change:
              </label>
              <textarea
                id="reason"
                className="form-control"
                placeholder="Enter reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                style={{ marginTop: "5px" }}
              />
            </div>

            <hr />

            {/* Recurring (Daily) points controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap"
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setRecurringPointsEdit(recurringPointsEdit - 1)}
              >
                -
              </button>
              <span>{recurringPointsEdit}</span>
              <button
                className="btn btn-secondary"
                onClick={() => setRecurringPointsEdit(recurringPointsEdit + 1)}
              >
                +
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSetRecurringPoints}
                title="This will reward the user daily with the set amount of points. To stop, set this to 0."
              >
                Set Recurring
              </button>
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Button
          variant="primary"
          onClick={() => handleViewAsDriver("/driver-dashboard")}
          style={{ width: "100%", margin: "5px 0" }}
        >
          Driver Dashboard
        </Button>
        <Button
          variant="primary"
          onClick={() => handleViewAsDriver("/cart")}
          style={{ width: "100%", margin: "5px 0" }}
        >
          Driver Cart
        </Button>
        <Button
          variant="primary"
          onClick={() => handleViewAsDriver("/catalog")}
          style={{ width: "100%", margin: "5px 0" }}
        >
          Driver Catalog
        </Button>
        {userGroup !== "Admin" && (
          <Button
            variant="primary"
            onClick={() => handleEditOrders("/edit-orders")}
            style={{ width: "100%", margin: "5px 0" }}
          >
            Edit Orders
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={handleCloseActionsModal}
          style={{ width: "100%", margin: "5px 0" }}
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>

    {/* User Editing Modal */}
    <UserModal
      isOpen={showEditModal}
      onClose={handleCloseEditModal}
      initialData={editData}
      emailList={allEmails}
    />
  </div>
);
};

export default ListOfUsersTable;
