import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { Modal, Button } from "react-bootstrap";
import { ViewOrgModal } from "./Modal";

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

const SPONSOR_BASE_URL = "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1";

export const ListOfUsersTable = ({
  driverTable,
  sponsorTable = [],
  adminTable = [],
  isSponsor = false,
}: Props) => {
  const auth = useAuth();

  // State for sponsor's organization ID (fetched from API)
  const [sponsorOrgID, setSponsorOrgID] = useState<string | null>(null);

  // Fetch the sponsor's org id via their email
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
          sponsor = data.find((s: any) => s.UserEmail === auth.user?.profile?.email);
        } else {
          sponsor = data;
        }
        if (sponsor && sponsor.UserOrganization) {
          console.log("Fetched sponsor organization ID:", sponsor.UserOrganization);
          setSponsorOrgID(sponsor.UserOrganization);
        } else {
          console.log("Sponsor record not found or no organization available.");
        }
      } catch (err) {
        console.error("Error fetching sponsor organization:", err);
      }
    };

    if (auth.user?.profile?.email) {
      fetchSponsorOrg();
    }
  }, [auth.user?.profile?.email]);

  const [isViewOrgModalOpen, setIsViewOrgModalOpen] = useState<boolean>(false);
  const [viewOrgEmail, setViewOrgEmail] = useState<string>("");
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

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
  };

  // Use the fetched sponsorOrgID for viewing as driver (if needed)
  const handleViewAsDriver = (targetRoute: string) => {
    console.log("Viewing as driver using sponsorOrgID:", sponsorOrgID);
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
  console.log("Editing orders for user:", selectedUser);
  localStorage.setItem(
    "driverEmailForEdit",
    JSON.stringify({
      driverEmail: selectedUser.DriverEmail,
      sponsorOrgID: sponsorOrgID,
    })
  );
  handleCloseActionsModal();
  window.open(targetRoute, "_blank");
};

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
                    onClick={() =>
                      console.log("Edit user code remains where it was (omitted).")
                    }
                  >
                    Edit
                  </button>
                </td>
              )}
              {/* Actions button */}
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
                    onClick={() =>
                      console.log("Edit user code remains where it was (omitted).")
                    }
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
                    onClick={() =>
                      console.log("Edit user code remains where it was (omitted).")
                    }
                  >
                    Edit
                  </button>
                </td>
              )}
              <td>
                <button className="btn btn-primary" onClick={() => handleShowActionsModal(admin)}>
                  Actions
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ViewOrgModal
        isOpen={isViewOrgModalOpen}
        onClose={() => setIsViewOrgModalOpen(false)}
        email={viewOrgEmail}
      />
      <Modal show={showActionsModal} onHide={handleCloseActionsModal}>
        <Modal.Header closeButton>
          <Modal.Title>View Site As Driver</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <p>
                <strong>User Email: </strong>
                {selectedUser.DriverEmail || selectedUser.UserEmail || "N / A"}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseActionsModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleViewAsDriver("/driver-dashboard")}>
            Driver Dashboard
          </Button>
          <Button variant="primary" onClick={() => handleViewAsDriver("/cart")}>
            Driver Cart
          </Button>
          <Button variant="primary" onClick={() => handleViewAsDriver("/catalog")}>
            Driver Catalog
          </Button>
          <Button variant="primary" onClick={() => handleEditOrders("/edit-orders")}>
            Edit Orders
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};