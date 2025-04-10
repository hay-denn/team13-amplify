import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import "./ApplicationTable.css";

const url_updateApplication =
  "https://2ml4i1kz7j.execute-api.us-east-1.amazonaws.com/dev1";

interface Application {
  ApplicationID: any;
  ApplicationDriver: string;
  ApplicationOrganization: any;
  ApplicationSponsorUser: string;
  ApplicationStatus: string;
  ApplicationDateSubmitted: string;
  ApplicationDecisionReason: string | null;
  ApplicationReason: string | null;
}

interface Props {
  applicationTable: Application[];
  sponsorsID: string;
}

export const ApplicationTable = ({ applicationTable, sponsorsID }: Props) => {
  const auth = useAuth();

  const [driver_email] = useState(auth.user?.profile.email || "");

  //Variable that stores a copy of the current table
  const [applist, setApps] = useState<Application[]>(applicationTable);

  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");

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
            ApplicationSponsorUser: driver_email,
            ApplicationID: selectedApp.ApplicationID,
            ApplicationStatus: newStatus,
            ApplicationDecisionReason: reason
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
          ? {
              ...app,
              ApplicationStatus: newStatus,
              ApplicationSponsorUser: driver_email,
            }
          : app
      )
    );
  };

  useEffect(() => {
    setApps(applicationTable);
  }, [applicationTable]);

  const filteredApps = applist.filter(
    (app) => app.ApplicationOrganization.toString() === sponsorsID.toString()
  );

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
            <th scope="col">Application Reason</th>
            <th>Options</th>
          </tr>
        </thead>
        <tbody>
          {filteredApps.map((app, index) => (
            <tr key={`app-${index}`}>
              <td>{app.ApplicationID}</td>
              <td>{app.ApplicationDriver}</td>
              <td>{app.ApplicationOrganization}</td>
              <td>{app.ApplicationSponsorUser}</td>
              <td>{app.ApplicationStatus}</td>
              <td>{app.ApplicationDateSubmitted}</td>
              <td>
                <div>
                  {app.ApplicationReason ? (
                  <span>{app.ApplicationReason}</span>
                  ) : (
                  <em>No reason provided</em>
                  )}
                </div>
              </td>
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
              <option value="Submitted">Change Status</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              </select>

              <label htmlFor="reasonInput" className="form-label mt-3">
              Reason for Status Change:
              </label>
              <textarea
              className="form-control"
              id="reasonInput"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for status change"
              rows={4}
              style={{ resize: "vertical" }}
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
    </div>
  );
};
