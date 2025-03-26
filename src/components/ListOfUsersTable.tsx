import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { ViewOrgModal } from "./Modal"; // 🔥 NEW CODE - If you still need the existing ViewOrgModal

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

export const ListOfUsersTable = ({
  driverTable,
  sponsorTable = [],
  adminTable = [],
  isSponsor = false,
}: Props) => {
  const [isViewOrgModalOpen, setIsViewOrgModalOpen] = useState<boolean>(false);
  const [viewOrgEmail, setViewOrgEmail] = useState<string>("");

  // 😎 NEW CODE - Modal state for "Actions"
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleViewOrg = (pemail: string) => {
    setViewOrgEmail(pemail);
    setIsViewOrgModalOpen(true);
  };

  // 😎 NEW CODE - Open the Actions modal
  const handleShowActionsModal = (user: any) => {
    setSelectedUser(user);
    setShowActionsModal(true);
  };

  // 😎 NEW CODE - Close the Actions modal
  const handleCloseActionsModal = () => {
    setShowActionsModal(false);
    setSelectedUser(null);
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
            {/* 😎 NEW CODE - Always show "Actions" column */}
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
                      console.log(
                        "Edit user code remains where it was (omitted)."
                      )
                    }
                  >
                    Edit
                  </button>
                </td>
              )}
              {/* 😎 NEW CODE - Actions button */}
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
                      console.log(
                        "Edit user code remains where it was (omitted)."
                      )
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
                      console.log(
                        "Edit user code remains where it was (omitted)."
                      )
                    }
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
      <ViewOrgModal
        isOpen={isViewOrgModalOpen}
        onClose={() => setIsViewOrgModalOpen(false)}
        email={viewOrgEmail}
      />
      {/* 😎 NEW CODE - Actions modal */}
      <Modal show={showActionsModal} onHide={handleCloseActionsModal}>
        <Modal.Header closeButton>
          <Modal.Title>View Site As Driver</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <p>
                <strong>User Email: </strong>
                {selectedUser.DriverEmail || selectedUser.UserEmail || "N/A"}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseActionsModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              console.log("View site as driver clicked");
              // Store both the driver's email and first name as a JSON string
              localStorage.setItem("impersonatingDriver", JSON.stringify({
                email: selectedUser.DriverEmail,
                firstName: selectedUser.DriverFName
              }));
              console.log("Impersonating driver:", selectedUser.DriverEmail, selectedUser.DriverFName);
              handleCloseActionsModal();
              window.open("/driver-dashboard", "_blank");
            }}
          >
            View site as driver
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
