import { useEffect, useState } from "react";
import "./PurchaseInfo.css";

export const PurchaseInfo = () => {
  const [numberOfOrgs, setNumberOfOrgs] = useState<number>(0);
  const [avgNumberOfPurchases, setAvgNumberOfPurchases] = useState<number>(0);
  const [totalNumberOfDrivers, setTotalNumberOfDrivers] = useState<number>(0);

  const numOrgUrl =
    "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";
  const purchaseCountUrl =
    "https://mk7fc3pb53.execute-api.us-east-1.amazonaws.com/dev1";
  const totalNumDriversUrl =
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

    getNumberOfOrgs();
    getTotalPurchases();
    getTotalNumDrivers();
  }, []);

  return (
    <div className="purchase-info-container">
      <div className="stats-grid">
        <div className="stat-card">
          <h3 className="stat-title">Organizations</h3>
          <p className="stat-value">{numberOfOrgs}</p>
          <p className="stat-description">Total Organizations</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Purchases</h3>
          <p className="stat-value">{avgNumberOfPurchases}</p>
          <p className="stat-description">Total Purchases</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Drivers</h3>
          <p className="stat-value">{totalNumberOfDrivers}</p>
          <p className="stat-description">Total Drivers</p>
        </div>
      </div>
    </div>
  );
};
