import { useEffect, useState } from "react";
import { ApplicationTable } from "../components/ListOfApplications";
import axios from "axios";
import "./Manageusers.css";

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

  const [applicationList, setApplicaitonList] = useState([]);

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

            <p className="card-text">Manage User Applicaitons below</p>

            <ApplicationTable
              applicationTable={applicationList}
            ></ApplicationTable>

            <a href="#" className="btn btn-primary">
              Add user
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
