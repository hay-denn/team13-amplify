import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import "./PurchaseByMonth.css";
const months = [
  { name: "January", count: 0 },
  { name: "February", count: 0 },
  { name: "March", count: 0 },
  { name: "April", count: 0 },
  { name: "May", count: 0 },
  { name: "June", count: 0 },
  { name: "July", count: 0 },
  { name: "August", count: 0 },
  { name: "September", count: 0 },
  { name: "October", count: 0 },
  { name: "November", count: 0 },
  { name: "December", count: 0 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

interface RecentSponsorPurchasesProps {
  SponsorID: number;
}

interface Purchase {
  PurchaseDate: string;
  PurchaseSponsorID: number;
}

export const PurchaseByMonth = ({ SponsorID }: RecentSponsorPurchasesProps) => {
  const purchase_url =
    "https://mk7fc3pb53.execute-api.us-east-1.amazonaws.com/dev1";

  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    const fetchOrganizations = async (): Promise<void> => {
      try {
        const response = await fetch(`${purchase_url}/purchases`);

        const data: Purchase[] = await response.json();

        const filteredPurchases = data.filter(
          (purchase) => purchase.PurchaseSponsorID === SponsorID
        );
        setPurchases(filteredPurchases);

        const sortedPurchases = filteredPurchases.sort(
          (a, b) =>
            new Date(b.PurchaseDate).getTime() -
            new Date(a.PurchaseDate).getTime()
        );
        setPurchases(sortedPurchases);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    fetchOrganizations();
  }, []);

  const calculateMonthCounts = (
    purchases: Purchase[]
  ): { name: string; count: number }[] => {
    const updatedMonths = months.map((month) => ({ ...month }));

    purchases.forEach((purchase) => {
      const date = new Date(purchase.PurchaseDate);
      const monthIndex = date.getMonth();

      if (monthIndex >= 0 && monthIndex < updatedMonths.length) {
        updatedMonths[monthIndex].count += 1;
      }
    });

    return updatedMonths;
  };

  const monthData = calculateMonthCounts(purchases);

  const topThreeMonths = [...monthData]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <div className="box-container">
      <h5 className="title">Most Purchases by Month for your Organization</h5>
      <div className="chartWrapper">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              dataKey="count"
              isAnimationActive={false}
              data={monthData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {monthData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="topMonthsHeader">Top Three Months</div>
      <div className="topMonthsContainer">
        {topThreeMonths.map((month, index) => (
          <div key={index} className="monthBox">
            <strong>{month.name}</strong>
            <p>{month.count} Purchases</p>
          </div>
        ))}
      </div>
    </div>
  );
};
