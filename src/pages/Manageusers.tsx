import { useEffect, useState } from "react";
import { ListOfUsersTable } from "../components/ListOfUsersTable";
import axios from "axios";
import "./Manageusers.css";
import Modal from "../components/Modal";
import { ListOfSponsorOrganizations } from "../components/ListOfSponsorOrgs";

export const Manageusers = () => {
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);

  const [isOrgModalOpen, setIsOrgModalOpen] = useState<boolean>(false);

  const [newOrgName, setNewOrgName] = useState<string>("");

  // Endpoints
  const url_drivers =
    "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1";
  const url_sponsors =
    "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1";
  const url_admin =
    "https://adahpqn530.execute-api.us-east-1.amazonaws.com/dev1";
  const url_organizations =
    "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

  const [driverList, setDriverList] = useState([]);
  const [sponsorList, setSponsorList] = useState([]);
  const [adminList, setAdminList] = useState([]);
  const [organizationList, setOrganizationList] = useState([]);
  const [emails, setEmails] = useState<string[]>([]);

  useEffect(() => {
    getDrivers();
    getSponsors();
    getAdmins();
    getOrganizations();
  }, []);

  const addEmailsToList = (jsonArray: { [key: string]: string }[], emailAttribute: string) => {
    const newEmails: string[] = [];
    jsonArray.forEach(json => {
        if (json[emailAttribute]) {
            newEmails.push(json[emailAttribute]);
        } else {
            console.log(`Email attribute "${emailAttribute}" not found in one of the provided JSON objects.`);
        }
    });
    setEmails(prevEmailList => [...prevEmailList, ...newEmails]);
};

  const getDrivers = async () => {
    try {
      const response = await axios.get(`${url_drivers}/drivers`);
      setDriverList(response.data);
      addEmailsToList(response.data, "DriverEmail");
    } catch (error) {
      console.error("Error fetching driver info:", error);
    }
  };

  const getSponsors = async () => {
    try {
      const response = await axios.get(`${url_sponsors}/sponsors`);
      setSponsorList(response.data);
      addEmailsToList(response.data, "UserEmail");
    } catch (error) {
      console.error("Error fetching sponsor info:", error);
    }
  };

  const getAdmins = async () => {
    try {
      const response = await axios.get(`${url_admin}/admins`);
      setAdminList(response.data);
      addEmailsToList(response.data, "AdminEmail");
    } catch (error) {
      console.error("Error fetching admin info:", error);
    }
  };

  const getOrganizations = async () => {
    try {
      const response = await axios.get(`${url_organizations}/organizations`);
      setOrganizationList(response.data);
    } catch (error) {
      console.error("Error fetching organization info:", error);
    }
  };

  const handleOpenUserModal = () => {
    setIsUserModalOpen(true);
  };
  const handleOpenOrgModal = () => {
    setIsOrgModalOpen(true);
  };

  const handleCreateOrganization = async () => {
    try {
      //Post requets that creates a new organization
      const response = await axios.post(`${url_organizations}/organization`, {
        OrganizationName: newOrgName,
      });

      console.log("New organization created:", response.data);
      getOrganizations();

      setNewOrgName("");
      setIsOrgModalOpen(false);
    } catch (error) {
      console.error("Error creating organization:", error);
    }
  };

  return (
    <div className="container manage-users-container py-3 m-5">
      <div className="card manage-users-card mt-5">
        <div className="card-body">
          <h5 className="manage-users-title card-title">Manage Users</h5>
          <p className="card-text">Create, edit, and manage users</p>

          <ListOfUsersTable
            driverTable={driverList}
            sponsorTable={sponsorList}
            adminTable={adminList}
          />

          <button
            onClick={handleOpenUserModal}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Create User
          </button>
          <Modal
            isOpen={isUserModalOpen}
            onClose={() => setIsUserModalOpen(false)}
            initialData={undefined}
            emailList={emails}
          />
        </div>
      </div>

      <div className="sponsor card manage-users-card mt-5">
        <div className="card-body">
          <h5 className="manage-users-title card-title">Manage Sponsors</h5>
          <p className="card-text">
            Create, edit, and manage different Sponsor Organizations
          </p>

          <ListOfSponsorOrganizations orgTable={organizationList} />

          <button
            onClick={handleOpenOrgModal}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Create New Organization
          </button>

          {isOrgModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Create New Organization</h2>
                <label htmlFor="orgName">Organization Name:</label>
                <input
                  id="orgName"
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                />
                <div style={{ marginTop: "1rem" }}>
                  <button
                    onClick={handleCreateOrganization}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#28a745",
                      color: "white",
                      borderRadius: "5px",
                      border: "none",
                      cursor: "pointer",
                      marginRight: "10px",
                    }}
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setIsOrgModalOpen(false)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      borderRadius: "5px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
