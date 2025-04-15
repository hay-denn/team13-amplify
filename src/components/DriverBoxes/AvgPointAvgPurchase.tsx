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
import "./AvgPointAvgPurchase.css";

interface Props {
  SponsorEmail: string;
}

export const AvgPointAvgPurchase = ({ SponsorEmail }: Props) => {
  const [numberOfDrivers, setNumberOfDrivers] = useState<number>(0);
  const [numberOfPurchases, setNumberOfPurchases] = useState<number>(0);
  const [driverPurchaseCount, setDriverPurchaseCount] = useState<number>(0);

  const numDriverUrl =
    "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1";
  const purchaseCountForDriver =
    "https://8y9n1ik5pc.execute-api.us-east-1.amazonaws.com/dev1";
  const totalNumberOfPurchases =
    "https://mk7fc3pb53.execute-api.us-east-1.amazonaws.com/dev1";

  useEffect(() => {
    const getNumberOfDrivers = async (): Promise<void> => {
      try {
        const response = await fetch(`${numDriverUrl}/driver_count`);
        const data = await response.json();
        setNumberOfDrivers(data.count);
      } catch (error) {
        console.error("Error fetching driver count:", error);
      }
    };

    const getTotalPurchases = async (): Promise<void> => {
      try {
        const response = await fetch(
          `${totalNumberOfPurchases}/purchase_count`
        );
        const data = await response.json();
        setNumberOfPurchases(data.count);
      } catch (error) {
        console.error("Error fetching total purchases:", error);
      }
    };

    const getDriversTotalNumOfPurchases = async (): Promise<void> => {
      try {
        const response = await fetch(
          `${purchaseCountForDriver}/purchases?DriverEmail==${SponsorEmail}`
        );
        const data = await response.json();
        setDriverPurchaseCount(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        console.error("Error fetching purchases for current driver:", error);
      }
    };

    getTotalPurchases();
    getNumberOfDrivers();
    getDriversTotalNumOfPurchases();
  }, [SponsorEmail]);

  const avgNumberOfPurchasesForAllDrivers =
    numberOfDrivers !== 0 ? numberOfPurchases / numberOfDrivers : 0;
  const numberOfPurchasesForCurrentDriver = driverPurchaseCount;

  const purchaseComparisonData = [
    {
      category: "Purchases",
      yourOrg: numberOfPurchasesForCurrentDriver,
      averageOrg: Number(avgNumberOfPurchasesForAllDrivers.toFixed(1)),
    },
  ];

  return (
    <div className="charts-container">
      <div className="chart-section">
        <h4>Your Number Of Purchases vs. Average Number Of Purchases</h4>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={purchaseComparisonData}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="yourOrg" name="Your Purchases" fill="#8884d8" />
              <Bar
                dataKey="averageOrg"
                name="Average Purchases"
                fill="#82ca9d"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
