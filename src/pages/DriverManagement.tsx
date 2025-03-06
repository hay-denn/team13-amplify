import { useEffect, useState } from "react";
import { ApplicationTable } from "../components/ListOfApplications";
import axios from "axios";
import "./Manageusers.css";
import { ListOfUsersTable } from "../components/ListOfUsersTable";

export const DriverManagement = () => {
  const url_getApplications =
    "https://2ml4i1kz7j.execute-api.us-east-1.amazonaws.com/dev1";

  const getApplications = async () => {
    try {
      const response = await axios.get(
        `${url_getApplications}/driversponsorapplications`
      );
      console.log(response);
      setApplicaitonList(response.data);
    } catch (error) {
      console.error("Error fetching driver info:", error);
    }
  };

  const url_drivers =
    "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1";

  const getDrivers = async () => {
    try {
      const response = await axios.get(`${url_drivers}/drivers`);
      console.log(response);
      setDriverList(response.data);
    } catch (error) {
      console.error("Error fetching driver info:", error);
    }
  };

  const [driverList, setDriverList] = useState([]);
  const [applicationList, setApplicaitonList] = useState([]);

  useEffect(() => {
    getApplications();
    getDrivers();
  }, []);

  return (
    <>
      <div className="container manage-users-container py-3 m-5">
        <div className="card manage-users-card mt-5">
          <div className="card-body">
            <h5 className="manage-users-title card-title">
              List Of Applications
            </h5>

            <p className="card-text">Manage User Applications below</p>

            <ApplicationTable
              applicationTable={applicationList}
            ></ApplicationTable>

            <a href="#" className="btn btn-primary">
              Add user
            </a>
          </div>
        </div>
        <div className="card manage-users-card mt-5">
          <div className="card-body">
            <h5 className="manage-users-title card-title">
              List of Sponsored Drivers
            </h5>

            <p className="card-text">
              Drivers associated with your organization
            </p>

            <ListOfUsersTable driverTable={driverList}></ListOfUsersTable>

            <a href="#" className="btn btn-primary">
              Add user
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
