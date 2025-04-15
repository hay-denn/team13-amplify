import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import "./PopularSearchTerms.css";
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#B22222",
  "#FF7F50",
  "#32CD32",
];

interface Organization {
  OrganizationID: number;
  OrganizationName: string;
  SearchTerm: string | null;
}

const SearchTermsPieChart = () => {
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);
  const orgUrl = "https://br9regxcob.execute-api.us-east-1.amazonaws.com/dev1";

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get<Organization[]>(
        `${orgUrl}/organizations`
      );
      const orgs = response.data;

      const termFrequency: { [key: string]: number } = {};

      orgs.forEach((org) => {
        if (org.SearchTerm) {
          const terms = org.SearchTerm.split(",");
          terms.forEach((rawTerm) => {
            const term = rawTerm.trim().toLowerCase();
            if (term) {
              termFrequency[term] = (termFrequency[term] || 0) + 1;
            }
          });
        }
      });

      const chartData = Object.entries(termFrequency).map(([name, value]) => ({
        name,
        value,
      }));

      setPieData(chartData);
    } catch (error) {
      console.error("Error fetching organization data:", error);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return (
    <div>
      <div className="popular-search-title">Popular Search Terms</div>
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {pieData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SearchTermsPieChart;
