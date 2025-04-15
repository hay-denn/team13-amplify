import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import "./PointPurchaseComparison.css";
interface Props {
  SponsorID: number;
}

export const PointPurchaseComparison = ({ SponsorID }: Props) => {
  const [numberOfOrgs, setNumberOfOrgs] = useState<number>(0);
  const [avgNumberOfPurchases, setAvgNumberOfPurchases] = useState<number>(0);
  const [totalNumberOfDrivers, setTotalNumberOfDrivers] = useState<number>(0);
  const [orgDriverCount, setOrgDriverCount] = useState<number>(0);
  const [orgPurchaseCount, setOrgPurchaseCount] = useState<number>(0);

  const numOrgUrl =
    "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";
  const purchaseCountUrl =
    "https://mk7fc3pb53.execute-api.us-east-1.amazonaws.com/dev1";
  const totalNumDriversUrl =
    "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1";
  const getDriversForMyOrgUrl =
    "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1";

  useEffect(() => {
    const getNumberOfOrgs = async (): Promise<void> => {
      try {
        const response = await fetch(`${numOrgUrl}/organization_count`);
        const data = await response.json();
        setNumberOfOrgs(data.count);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    const getTotalPurchases = async (): Promise<void> => {
      try {
        const response = await fetch(`${purchaseCountUrl}/purchase_count`);
        const data = await response.json();

        setAvgNumberOfPurchases(data.count);
      } catch (error) {
        console.error("Error fetching purchases:", error);
      }
    };

    const getTotalNumDrivers = async (): Promise<void> => {
      try {
        const response = await fetch(`${totalNumDriversUrl}/driver_count`);
        const data = await response.json();
        setTotalNumberOfDrivers(data.count);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };

    const getMyOrgsNumberOfDrivers = async (): Promise<void> => {
      try {
        const response = await fetch(
          `${getDriversForMyOrgUrl}/drivers?OrganizationID=${SponsorID}`
        );
        const data = await response.json();
        setOrgDriverCount(data.length);
      } catch (error) {
        console.error("Error fetching organization drivers:", error);
      }
    };

    const getMyOrgsNumberOfPurchases = async (): Promise<void> => {
      try {
        const response = await fetch(
          `https://8y9n1ik5pc.execute-api.us-east-1.amazonaws.com/dev1/purchases?SponsorID=${SponsorID}`
        );
        const data = await response.json();
        setOrgPurchaseCount(data.length);
      } catch (error) {
        console.error("Error fetching organization purchases:", error);
      }
    };

    getNumberOfOrgs();
    getTotalPurchases();
    getTotalNumDrivers();
    getMyOrgsNumberOfDrivers();
    getMyOrgsNumberOfPurchases();
  }, [SponsorID]);

  const computedAvgDrivers = numberOfOrgs
    ? totalNumberOfDrivers / numberOfOrgs
    : 0;
  const computedAvgPurchases = numberOfOrgs
    ? avgNumberOfPurchases / numberOfOrgs
    : 0;

  const userComparisonData = [
    {
      category: "Users",
      yourOrg: orgDriverCount,
      averageOrg: Number(computedAvgDrivers.toFixed(1)),
    },
  ];

  const purchaseComparisonData = [
    {
      category: "Purchases",
      yourOrg: orgPurchaseCount,
      averageOrg: Number(computedAvgPurchases.toFixed(1)),
    },
  ];

  return (
    <div className="charts-container">
      <div className="chart-section">
        <h4>Your Org's Users vs. Average Org Users</h4>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={userComparisonData}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="yourOrg" name="Your Org" fill="#8884d8" />
              <Bar dataKey="averageOrg" name="Average Org" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-section">
        <h4>Your Org's Purchases vs. Average Org Purchases</h4>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={purchaseComparisonData}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="yourOrg" name="Your Org" fill="#8884d8" />
              <Bar dataKey="averageOrg" name="Average Org" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
