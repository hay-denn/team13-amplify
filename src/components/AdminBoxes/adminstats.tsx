import axios from "axios";
import { useEffect, useState } from "react";
import "./adminstats.css";

interface AppInfo {
  ApplicationDriver: string;
  ApplicationOrganization: number;
  ApplicationStatus: string;
  ApplicationDateSubmitted: string;
  ApplicationReason: any;
}

export const AdminStats = () => {
  const url_getCountDriversUrl =
    "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1";

  const [driverCount, setDriverCount] = useState<any>("");

  const [appData, setAppData] = useState<AppInfo[]>([]);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await axios.get(
          `${url_getCountDriversUrl}/driver_count`
        );
        setDriverCount(response.data.count);
      } catch (error) {
        console.error("Error fetching organization data:", error);
      }
    };

    const fetchApplications = async () => {
      try {
        const response = await fetch(
          `https://2ml4i1kz7j.execute-api.us-east-1.amazonaws.com/dev1/driversponsorapplications`
        );

        const data: AppInfo[] = await response.json();

        setAppData(data);
      } catch (error) {
        console.error("Error fetching organization data:", error);
      }
    };
    fetchOrganization();
    fetchApplications();
  }, []);

  const approvedCount = appData.filter(
    (app) => app.ApplicationStatus === "Approved"
  ).length;

  const rejectedCount = appData.filter(
    (app) => app.ApplicationStatus === "Rejected"
  ).length;

  return (
    <div className="faststats-container">
      <div className="stats-section">
        <h5 className="stats-title">Total Number Of Users</h5>
        <p className="stats-value">{driverCount}</p>
        <a href="/manageusers" className="stats-button">
          Manage Users
        </a>
      </div>
      <div className="stats-section">
        <h5 className="stats-title">Total Number Of Applications</h5>
        <p className="stats-value">{appData.length}</p>
        <p className="stats-approved">Approved: {approvedCount} Applications</p>
        <p className="stats-rejected">Rejected: {rejectedCount} Applications</p>
      </div>
    </div>
  );
};
