import { useEffect, useState } from "react";
import axios from "axios";
import "./Manageusers.css";
import { ListOfSponsorOrganizations } from "../components/ListOfSponsorOrgs";

export const ManageSponsors = () => {
  const [isOrgModalOpen, setIsOrgModalOpen] = useState<boolean>(false);

  const [newOrgName, setNewOrgName] = useState<string>("");

  // Endpoints
  const url_organizations =
    "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

  const [organizationList, setOrganizationList] = useState([]);

  useEffect(() => {
    getOrganizations();
  }, []);

  const getOrganizations = async () => {
    try {
      const response = await axios.get(`${url_organizations}/organizations`);
      setOrganizationList(response.data);
    } catch (error) {
      console.error("Error fetching organization info:", error);
    }
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
