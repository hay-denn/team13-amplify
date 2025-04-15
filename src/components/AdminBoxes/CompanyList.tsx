import axios from "axios";
import { useEffect, useState } from "react";
import "./CompanyList.css";
import { Bar, BarChart, Cell, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { CartesianGrid, ResponsiveContainer } from "recharts";

interface OrganizationPurchases {
  OrgId: number;
  OrgName: string;
  NumberOfPurchases?: number;
}

export const ListOfOrganizationsBox = () => {
  const org_url = "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";
  const purchase_url =
    "https://mk7fc3pb53.execute-api.us-east-1.amazonaws.com/dev1";

  const [organizationPurchaseInfo, setOrganizationPurchaseInfo] = useState<
    OrganizationPurchases[]
  >([]);
  const [purchaseIDs, setPurchaseIDs] = useState<number[]>([]);

  const transformData = (data: any): OrganizationPurchases => ({
    OrgId: data.OrganizationID,
    OrgName: data.OrganizationName,
    NumberOfPurchases: 0, // starts at 0
  });

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get(`${org_url}/organizations`);
      const newDataArray = Array.isArray(response.data)
        ? response.data.map(transformData)
        : [transformData(response.data)];
      // Set organization data only once.
      setOrganizationPurchaseInfo(newDataArray);
    } catch (error) {
      console.error("Error fetching organization data:", error);
    }
  };

  const fetchPurchases = async () => {
    try {
      const response = await axios.get(`${purchase_url}/purchases`);
      const ids: number[] = response.data.map(
        (purchase: any) => purchase.PurchaseSponsorID
      );
      setPurchaseIDs(ids);
    } catch (error) {
      console.error("Error fetching organization data:", error);
    }
  };

  // Update organization purchase counts only if there is a change.
  const updateOrganizationPurchaseCounts = () => {
    const updatedOrgs = organizationPurchaseInfo.map((org) => {
      const count = purchaseIDs.filter((id) => id === org.OrgId).length;
      return { ...org, NumberOfPurchases: count };
    });

    // Check if updatedOrgs differs from the current organizationPurchaseInfo.
    const isDifferent = updatedOrgs.some((org, index) => {
      return (
        organizationPurchaseInfo[index]?.NumberOfPurchases !==
        org.NumberOfPurchases
      );
    });

    if (isDifferent) {
      setOrganizationPurchaseInfo(updatedOrgs);
    }
  };

  // Fetch organizations and purchases on mount.
  useEffect(() => {
    fetchOrganizations();
    fetchPurchases();
  }, []);

  // When both organizationPurchaseInfo and purchaseIDs are available, update the counts.
  useEffect(() => {
    if (organizationPurchaseInfo.length && purchaseIDs.length) {
      updateOrganizationPurchaseCounts();
    }
    // We include purchaseIDs as a dependency.
    // The updateOrganizationPurchaseCounts now only triggers a state change if counts differ.
  }, [purchaseIDs, organizationPurchaseInfo]);

  // Get the top 7 organizations by NumberOfPurchases.
  const getTopOrganizations = (
    orgs: OrganizationPurchases[]
  ): OrganizationPurchases[] => {
    return [...orgs]
      .sort((a, b) => (b.NumberOfPurchases ?? 0) - (a.NumberOfPurchases ?? 0))
      .slice(0, 7);
  };

  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7f50",
    "#87CEFA",
    "#9370DB",
    "#3CB371",
  ];

  return (
    <>
      <div className="chartBox">
        <div className="boxInfo">
          <div className="title">
            <img src="/images/Purchase.png" alt="" />
            <span>Companies with the Most Purchases:</span>
          </div>
          <div className="chartInfo">
            <div className="chart"></div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                width={500}
                height={300}
                data={getTopOrganizations(organizationPurchaseInfo)}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="OrgName" />
                <YAxis
                  label={{
                    value: "Total Purchases",
                    angle: -90,
                    dx: -20,
                    dy: 0,
                  }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="NumberOfPurchases">
                  {getTopOrganizations(organizationPurchaseInfo).map(
                    (_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    )
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="texts"></div>
          </div>
        </div>
      </div>
      {/* Uncomment below if you want to display additional info */}
      {/* <div>
        {organizationPurchaseInfo.map((org) => (
          <div key={org.OrgId}>
            <h2>{org.OrgName}</h2>
            <p>Organization ID: {org.OrgId}</p>
            <p>Total Purchases: {org.NumberOfPurchases}</p>
          </div>
        ))}
      </div>
      <div>
        <h1>Purchase IDs</h1>
        <ul>
          {purchaseIDs.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      </div> */}
    </>
  );
};
