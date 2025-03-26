import { useEffect, useState } from "react";
import { ApplicationTable } from "../components/ListOfApplications";
import axios from "axios";
import "./Manageusers.css";
import { ListOfUsersTable } from "../components/ListOfUsersTable";
import { useAuth } from "react-oidc-context";
import { Modal, Button, Form } from "react-bootstrap";

export const DriverManagement = () => {
  const auth = useAuth();
  const [driver_email] = useState(auth.user?.profile.email || "");
  const url_drivers = "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1";
  const url_getApplications = "https://2ml4i1kz7j.execute-api.us-east-1.amazonaws.com/dev1";
  const url_getSponsorID = "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1";
  const url_addSponsorRelationship = "https://vnduk955ek.execute-api.us-east-1.amazonaws.com/dev1";
  const [driverList, setDriverList] = useState([]);
  const [currentSponsorId, setCurrentSponsorId] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newDriverEmail, setNewDriverEmail] = useState("");
  const [applicationList, setApplicaitonList] = useState([]);

  const handleAddUser = async () => {
    try {
      // 🔥 NEW CODE - Fixed string interpolation
      const response = await fetch(`${url_addSponsorRelationship}/driverssponsor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          DriversEmail: newDriverEmail,
          DriversSponsorID: currentSponsorId,
        }),
      });
      if (!response.ok) {
        // 🔥 NEW CODE - Fixed error message formatting
        throw new Error(`Request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
    console.log("Adding user with email:", newDriverEmail);
    console.log("Using Sponsor Organization ID:", currentSponsorId);
    setNewDriverEmail("");
    setShowAddUserModal(false);
  };

  // 🔥 NEW CODE - Fixed template string
  const getDrivers = async () => {
    try {
      const response = await axios.get(`${url_drivers}/drivers?OrganizationID=${currentSponsorId}`);
      setDriverList(response.data);
    } catch (error) {
      console.error("Error fetching driver info:", error);
    }
    console.log(driver_email);
  };

  const getCurrentSponsorOrganization = async () => {
    try {
      const response = await axios.get(`${url_getSponsorID}/sponsor?UserEmail=${driver_email}`);
      setCurrentSponsorId(response.data.UserOrganization);
    } catch (error) {
      console.error("Error fetching driver info:", error);
    }
  };

  const getApplications = async () => {
    try {
      const response = await axios.get(`${url_getApplications}/driversponsorapplications`);
      setApplicaitonList(response.data);
    } catch (error) {
      console.error("Error fetching driver info:", error);
    }
  };

  useEffect(() => {
    getCurrentSponsorOrganization();
  }, []);

  useEffect(() => {
    if (currentSponsorId) {
      getDrivers();
    }
  }, [currentSponsorId]);

  useEffect(() => {
    getApplications();
  }, []);

  const handleShowAddUserModal = () => {
    setShowAddUserModal(true);
  };

  const handleCloseAddUserModal = () => {
    setShowAddUserModal(false);
    setNewDriverEmail("");
  };

  return (
    <>
      <div className="container manage-users-container py-3 m-5">
        <div className="card manage-users-card mt-5">
          <div className="card-body">
            <h5 className="manage-users-title card-title">List Of Applications</h5>
            <p className="card-text">Manage User Applications below</p>
            <ApplicationTable applicationTable={applicationList}></ApplicationTable>
            <a href="#" className="btn btn-primary">
              Add user
            </a>
          </div>
        </div>

        <div className="card manage-users-card mt-5">
          <div className="card-body">
            <h5 className="manage-users-title card-title">List Of Drivers</h5>
            <p className="card-text">Users Associated With Your Organization</p>
            <ListOfUsersTable driverTable={driverList} isSponsor={true}></ListOfUsersTable>
            <Button variant="primary" onClick={handleShowAddUserModal}>
              Add A New Sponsor
            </Button>
            <Modal show={showAddUserModal} onHide={handleCloseAddUserModal}>
              <Modal.Header closeButton>
                <Modal.Title>Add New Driver</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group controlId="formDriverEmail" className="mb-3">
                    <Form.Label>Driver Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter new driver email"
                      value={newDriverEmail}
                      onChange={(e) => setNewDriverEmail(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group controlId="formSponsorOrgId" className="mb-3">
                    <Form.Label>Sponsor Organization ID</Form.Label>
                    <Form.Control type="text" value={currentSponsorId} readOnly />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseAddUserModal}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleAddUser}>
                  Add
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      </div>
    </>
  );
};
