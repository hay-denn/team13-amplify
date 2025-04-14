import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { useAuth } from "react-oidc-context";
import "./ApplicationTable.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";


const url_updateApplication =
  "https://2ml4i1kz7j.execute-api.us-east-1.amazonaws.com/dev1";

const driversponsor_url =
  "https://obf2ta0gw9.execute-api.us-east-1.amazonaws.com/dev1";


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
  
  const [sponsor_email] = useState(auth.user?.profile.email || "");
  const [applist, setApps] = useState<Application[]>(applicationTable);
  const [acceptedDriverList, setAcceptedDriverList] = useState<string[]>([]);
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
    setReason("");
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setNewStatus(event.target.value);
  };

  const getAcceptedDrivers = async () => {
    const response = await fetch(
      `${driversponsor_url}/driverssponsors?DriversSponsorID=${sponsorsID}`
    );
    if (!response.ok) {
      console.error("Failed to fetch accepted drivers");
      return;
    }
    const data = await response.json();
    const acceptedDrivers = data.map((driver: any) =>
      driver.DriversEmail.toLowerCase()
    );
    setAcceptedDriverList(acceptedDrivers);
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
            ApplicationSponsorUser: sponsor_email,
            ApplicationID: selectedApp.ApplicationID,
            ApplicationStatus: newStatus,
            ApplicationDecisionReason: reason,
          }),
        }
      );
      if (!response.ok) {
        console.log(response);
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
              ApplicationSponsorUser: sponsor_email,
            }
          : app
      )
    );
  };

  useEffect(() => {
    getAcceptedDrivers();
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
            <th scope="col">Sponsor User</th>
            <th scope="col">Status</th>
            <th scope="col">Date Submitted</th>
            <th scope="col">Application Reason</th>
            <th>Options</th>
          </tr>
        </thead>
        <tbody>
          {filteredApps.map((app, index) => {
            const driverEmailLower = app.ApplicationDriver.toLowerCase();
            const isAlreadySponsored = acceptedDriverList.includes(driverEmailLower);
  
            return (
              <tr key={`app-${index}`}>
                <td>{app.ApplicationID}</td>
                <td>{app.ApplicationDriver}</td>
                <td>{app.ApplicationSponsorUser}</td>
                <td>{app.ApplicationStatus}</td>
                <td>{app.ApplicationDateSubmitted}</td>
                <td>
                  {app.ApplicationReason ? (
                    <span>{app.ApplicationReason}</span>
                  ) : (
                    <em>No reason provided</em>
                  )}
                </td>
                <td>
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 0, hide: 100 }}
                    overlay={
                      <Tooltip id={`tooltip-${index}`}>
                        {isAlreadySponsored
                          ? "Driver currently sponsored"
                          : "Manage application"}
                      </Tooltip>
                    }
                  >
                    <span className="d-inline-block" style={{ cursor: "not-allowed" }}>
                      <button
                        className={`btn ${
                          isAlreadySponsored ? "btn-secondary" : "btn-primary"
                        }`}
                        onClick={() => handleShowModal(app)}
                        disabled={isAlreadySponsored}
                        style={isAlreadySponsored ? { pointerEvents: "none" } : {}}
                      >
                        Actions
                      </button>
                    </span>
                  </OverlayTrigger>
                </td>
              </tr>
            );
          })}
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
}
export default ApplicationTable;  
