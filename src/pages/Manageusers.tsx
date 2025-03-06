import { useEffect, useState } from "react";
import { ListOfUsersTable } from "../components/ListOfUsersTable";
import axios from "axios";
import "./Manageusers.css";
import Modal from "../components/Modal";

export const Manageusers = () => {
  //Function to retrieve the users
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleCreateUser = () => {
    setIsModalOpen(true);
  };

  const url_drivers =
    "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1";

  const url_sponsors =
    "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1";

  const url_admin =
    "https://adahpqn530.execute-api.us-east-1.amazonaws.com/dev1";

  const getDrivers = async () => {
    try {
      const response = await axios.get(`${url_drivers}/drivers`);
      console.log(response);
      setDriverList(response.data);
    } catch (error) {
      console.error("Error fetching driver info:", error);
    }
  };

  const getSponsors = async () => {
    try {
      const response = await axios.get(`${url_sponsors}/sponsors`);
      console.log(response);
      setSponsorList(response.data);
    } catch (error) {
      console.error("Error fetching driver info:", error);
    }
  };

  const getAdmins = async () => {
    try {
      const response = await axios.get(`${url_admin}/admins`);
      console.log(response);
      setAdminList(response.data);
    } catch (error) {
      console.error("Error fetching driver info:", error);
    }
  };

  const [driverList, setDriverList] = useState([]);
  const [sponsorList, setSponsorList] = useState([]);
  const [adminList, setAdminList] = useState([]);

  //Uses useEffect to run code when the component renders
  //Note* the [] means it runs once, when the website is mounted
  //Useful to retreive information from APIs
  useEffect(() => {
    getDrivers();
    getSponsors();
    getAdmins();
  }, []);

  return (
    <>
      <div className="container manage-users-container py-3 m-5">
        <div className="card manage-users-card mt-5">
          <div className="card-body">
            <h5 className="manage-users-title card-title">Manage Users</h5>
            <p className="card-text">Create, edit, and manage users</p>

            <ListOfUsersTable
              driverTable={driverList}
              sponsorTable={sponsorList}
              adminTable={adminList}
            ></ListOfUsersTable>
            <button
              onClick={handleCreateUser}
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
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              initialData={undefined}
            />
          </div>
        </div>
      </div>
    </>
  );
};
