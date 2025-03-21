import { useEffect, useState } from "react";
import { ApplicationTable } from "../components/ListOfApplications";
import axios from "axios";
import "./Manageusers.css";
import { ListOfUsersTable } from "../components/ListOfUsersTable";
import { useAuth } from "react-oidc-context";

export const DriverManagement = () => {
  const auth = useAuth();

  const [driver_email] = useState(auth.user?.profile.email || "");
  const url_drivers =
    "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1";

  const url_getApplications =
    "https://2ml4i1kz7j.execute-api.us-east-1.amazonaws.com/dev1";

  const url_getSponsorID =
    "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1";

  const [driverList, setDriverList] = useState([]);

  const [currentSponsorId, setCurrentSponsorId] = useState("");

  const getDrivers = async () => {
    try {
      const response = await axios.get(
        `${url_drivers}/drivers?OrganizationID=${currentSponsorId}'`
      );
      setDriverList(response.data);
    } catch (error) {
      console.error("Error fetching driver info:", error);
    }

    console.log(driver_email);
  };

  const getCurrentSponsorOrganization = async () => {
    try {
      const response = await axios.get(
        `${url_getSponsorID}/sponsor?UserEmail=${driver_email}`
      );
      console.log(response);
      console.log(response.data.UserOrganization);
      setCurrentSponsorId(response.data.UserOrganization);
    } catch (error) {
      console.error("Error fetching driver info:", error);
    }
  };

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

  const [applicationList, setApplicaitonList] = useState([]);

  useEffect(() => {
    getCurrentSponsorOrganization();
  }, []);

  //Makes sure the drivers are called after the current logged in sponsor's id is set.
  useEffect(() => {
    if (currentSponsorId) {
      getDrivers();
    }
  }, [currentSponsorId]);

  useEffect(() => {
    getApplications();
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
          </div>
        </div>

        <div className="card manage-users-card mt-5">
          <div className="card-body">
            <h5 className="manage-users-title card-title">List Of Drivers</h5>

            <p className="card-text">Users Associated With Your Organization</p>

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
