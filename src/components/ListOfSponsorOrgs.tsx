import { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";

interface Organization {
  OrganizationID: string;
  OrganizationName: string;
}

interface Props {
  orgTable: Organization[];
}

export const ListOfSponsorOrganizations = ({ orgTable }: Props) => {
  const sponsorOrgUrl =
    "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";
  //Variable that stores a copy of the current table
  const [orglist, setOrgs] = useState<Organization[]>(orgTable);

  const [showModal, setShowModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [newStatus, setNewStatus] = useState("");

  const handleShowModal = (org: Organization) => {
    setSelectedOrg(org);
    setNewStatus(org.OrganizationName);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrg(null);
    setNewStatus("");
  };

  const handleStatusChange = (event: any) => {
    setNewStatus(event.target.value);
  };

  const handleSaveStatus = async () => {
    if (!selectedOrg) return;
    try {
      const response = await fetch(`${sponsorOrgUrl}/organization`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          OrganizationID: selectedOrg.OrganizationID,
          OrganizationName: newStatus,
        }),
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      handleCloseModal();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
    setOrgs((prevOrg) =>
      prevOrg.map((org) =>
        org.OrganizationName === selectedOrg.OrganizationName
          ? { ...org, OrganizationName: newStatus }
          : org
      )
    );
  };

  useEffect(() => {
    setOrgs(orgTable);
  }, [orgTable]);

  return (
    <div>
      <table className="table table-striped table-bordered table-hover align-middle">
        <thead className="table-secondary">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Org ID</th>
            <th scope="col">Org Name</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orglist.map((org, index) => (
            <tr key={`org-${index}`}>
              <th scope="row">{index + 1}</th>
              <td>{org.OrganizationID}</td>
              <td>{org.OrganizationName}</td>
              <td>
                <button
                  className="btn btn-primary"
                  onClick={() => handleShowModal(org)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update Organization Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrg && (
            <>
              <p>
                <strong>OrganizationName: </strong>
                {selectedOrg.OrganizationName}
              </p>
              <label htmlFor="statusSelect" className="form-label">
                New Name For This Organization:
              </label>
              <input
                type="text"
                id="statusInput"
                className="form-control"
                value={newStatus}
                onChange={handleStatusChange}
                placeholder="Enter new status"
              />
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveStatus}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
      {/* <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={modalData}
      /> */}
    </div>
  );
};
