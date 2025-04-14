import axios from "axios";
import { useEffect, useState } from "react";
import "./faststats.css";

interface Props {
  SponsorID: number;
}

interface AppInfo {
  ApplicationDriver: string;
  ApplicationOrganization: number;
  ApplicationStatus: string;
  ApplicationDateSubmitted: string;
  ApplicationReason: any;
}

export const Faststats = ({ SponsorID }: Props) => {
  const url_getCountDriversUrl =
    "https://obf2ta0gw9.execute-api.us-east-1.amazonaws.com/dev1";

  const [driverCount, setDriverCount] = useState<any>("");

  const [appData, setAppData] = useState<AppInfo[]>([]);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await axios.get(
          `${url_getCountDriversUrl}/driverssponsors_count?DriversSponsorID=${SponsorID}`
        );
        setDriverCount(response.data.DriverCount);
      } catch (error) {
        console.error("Error fetching organization data:", error);
      }
    };

    const fetchApplications = async () => {
      try {
        const response = await fetch(
          `https://8y9n1ik5pc.execute-api.us-east-1.amazonaws.com/dev1/driverApplications?StartDate=2000-01-01&EndDate=3000-01-01&SponsorID=${SponsorID}`
        );

        const data: AppInfo[] = await response.json();

        setAppData(data);
      } catch (error) {
        console.error("Error fetching organization data:", error);
      }
    };
    fetchOrganization();
    fetchApplications();
  }, [SponsorID]);

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
        <a href="/DriverManagement" className="stats-button">
          View All Users
        </a>
      </div>
      <div className="stats-section">
        <h5 className="stats-title">Total Number Of Applications</h5>
        <p className="stats-value">{appData.length}</p>
        <p className="stats-approved">Approved: {approvedCount} Applications</p>
        <p className="stats-rejected">Rejected: {rejectedCount} Applications</p>
        <a href="/DriverManagement" className="stats-button">
          View All Applications
        </a>
      </div>
    </div>
  );
};
