import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { Modal, Button } from "react-bootstrap";

// IMPORTANT: rename the default export from "./Modal" so it doesn't clash
// with react-bootstrap's Modal.
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

export const ListOfUsersTable = ({
  driverTable,
  sponsorTable = [],
  adminTable = [],
  isSponsor = false,
}: Props) => {
  const auth = useAuth();

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

  // For the "Edit" modal (creating/updating user info)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  // Build a single list of all user emails for the modal’s validation
  const allEmails = [
    ...driverTable.map((d) => d.DriverEmail),
    ...sponsorTable.map((s) => s.UserEmail),
    ...adminTable.map((a) => a.AdminEmail),
  ];

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

  const handleShowActionsModal = (user: any) => {
    setSelectedUser(user);
    setShowActionsModal(true);
  };

  const handleCloseActionsModal = () => {
    setShowActionsModal(false);
    setSelectedUser(null);
    setCurrentPoints(null);
    setPointsChange(0);
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
        `https://vnduk955ek.execute-api.us-east-1.amazonaws.com/dev1/driverssponsor?DriversEmail=${encodeURIComponent(
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

  useEffect(() => {
    if (selectedUser && sponsorOrgID) {
      const driverEmail = selectedUser.DriverEmail || selectedUser.UserEmail;
      if (driverEmail) {
        fetchCurrentPoints(driverEmail);
      }
    }
  }, [selectedUser, sponsorOrgID]);

  const handleChangePoints = async () => {
    if (pointsChange === 0) {
      alert("Please input a non-zero value to change points.");
      return;
    }
    const driverEmail = selectedUser.DriverEmail || selectedUser.UserEmail;
    const sponsorEmail = auth.user?.profile?.email || "";
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

  // =========================================
  // EDIT MODAL METHODS
  // =========================================
  const handleEditUser = (user: any, userType: string) => {
    // Build up initialData in the shape the modal expects
    let firstName = "";
    let familyName = "";
    let email = "";
    let org = "";

    if (userType === "Driver") {
      firstName = user.DriverFName;
      familyName = user.DriverLName;
      email = user.DriverEmail;
      // Drivers may not have an org here (they may have multiple sponsors)
      // so we can leave org as "" or handle it if you store a single sponsor:
      // org = user.DriverSponsor;
    } else if (userType === "Sponsor") {
      firstName = user.UserFName;
      familyName = user.UserLName;
      email = user.UserEmail;
      org = user.UserOrganization; // sponsor org
    } else if (userType === "Admin") {
      firstName = user.AdminFName;
      familyName = user.AdminLName;
      email = user.AdminEmail;
      // admin typically has no org
    }

    setEditData({
      firstName,
      familyName,
      email,
      userType,
      newUser: false, // We are editing an existing user
      org,
    });

    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  // =========================================
  // RENDER
  // =========================================
  return (
    <div>
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
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleViewOrg(driver.DriverEmail)}
                  >
                    View
                  </button>
                </td>
              )}
              {!isSponsor && (
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleEditUser(driver, "Driver")}
                  >
                    Edit
                  </button>
                </td>
              )}
              <td>
                <button
                  className="btn btn-primary"
                  onClick={() => handleShowActionsModal(driver)}
                >
                  Actions
                </button>
              </td>
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
                <button
                  className="btn btn-primary"
                  onClick={() => handleShowActionsModal(sponsor)}
                >
                  Actions
                </button>
              </td>
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
                <button
                  className="btn btn-primary"
                  onClick={() => handleShowActionsModal(admin)}
                >
                  Actions
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* View Organizations Modal */}
      <ViewOrgModal
        isOpen={isViewOrgModalOpen}
        onClose={() => setIsViewOrgModalOpen(false)}
        email={viewOrgEmail}
      />

      {/* Actions Modal (Points, Impersonation, etc.) */}
      <Modal show={showActionsModal} onHide={handleCloseActionsModal}>
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
              <p>
                <strong>User Points: </strong>
                {currentPoints !== null ? currentPoints : "Loading..."}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
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
                <button className="btn btn-primary" onClick={handleChangePoints}>
                  Change Points
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
          <Button
            variant="primary"
            onClick={() => handleEditOrders("/edit-orders")}
            style={{ width: "100%", margin: "5px 0" }}
          >
            Edit Orders
          </Button>
          <Button
            variant="secondary"
            onClick={handleCloseActionsModal}
            style={{ width: "100%", margin: "5px 0" }}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Our renamed User-Editing Modal */}
      <UserModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        initialData={editData}
        emailList={allEmails}
      />
    </div>
  );
};
