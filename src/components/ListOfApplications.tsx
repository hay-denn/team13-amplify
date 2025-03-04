import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useEffect } from "react";

const url_updateApplication =
  "https://2ml4i1kz7j.execute-api.us-east-1.amazonaws.com/dev1";

interface Application {
  ApplicationID: any;
  ApplicationDriver: string;
  ApplicationOrganization: any;
  ApplicationSponsorUser: string;
  ApplicationStatus: string;
  ApplicationDateSubmitted: string;
}

interface Props {
  applicationTable: Application[];
}

export const ApplicationTable = ({ applicationTable }: Props) => {
  //Variable that stores a copy of the current table
  const [applist, setApps] = useState<Application[]>(applicationTable);

  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState("");

  const handleShowModal = (app: Application) => {
    setSelectedApp(app);
    setNewStatus(app.ApplicationStatus);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedApp(null);
    setNewStatus("");
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setNewStatus(event.target.value);
  };

  const handleSaveStatus = async () => {
    if (!selectedApp) return;
    try {
      const response = await fetch(
        `${url_updateApplication}/driversponsorapplication`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ApplicationID: selectedApp.ApplicationID,
            ApplicationStatus: newStatus,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      handleCloseModal();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
    setApps((prevApps) =>
      prevApps.map((app) =>
        app.ApplicationID === selectedApp.ApplicationID
          ? { ...app, ApplicationStatus: newStatus }
          : app
      )
    );
  };

  useEffect(() => {
    setApps(applicationTable);
  }, []);

  return (
    <div>
      <table className="table table-striped table-bordered table-hover align-middle">
        <thead className="table-secondary">
          <tr>
            <th scope="col">Application ID</th>
            <th scope="col">Driver</th>
            <th scope="col">Organization</th>
            <th scope="col">Sponsor User</th>
            <th scope="col">Status</th>
            <th scope="col">Date Submitted</th>
            <th>Options</th>
          </tr>
        </thead>
        <tbody>
          {applist.map((app, index) => (
            <tr key={`app-${index}`}>
              <td>{app.ApplicationID}</td>
              <td>{app.ApplicationDriver}</td>
              <td>{app.ApplicationOrganization}</td>
              <td>{app.ApplicationSponsorUser}</td>
              <td>{app.ApplicationStatus}</td>
              <td>{app.ApplicationDateSubmitted}</td>
              <td>
                <button
                  className="btn btn-primary"
                  onClick={() => handleShowModal(app)}
                >
                  Actions
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update Application Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApp && (
            <>
              <p>
                <strong>Application ID: </strong>
                {selectedApp.ApplicationID}
              </p>
              <p>
                <strong>Driver: </strong>
                {selectedApp.ApplicationDriver}
              </p>
              <p>
                <strong>Current Status: </strong>
                {selectedApp.ApplicationStatus}
              </p>

              <label htmlFor="statusSelect" className="form-label">
                New Status:
              </label>
              <select
                id="statusSelect"
                className="form-select"
                value={newStatus}
                onChange={handleStatusChange}
              >
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
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
    </div>
  );
};
