import { Link } from "react-router-dom";
import "./chartBox.css";
import {
  Bar,
  BarChart,
  Legend,
  Rectangle,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CartesianGrid, ResponsiveContainer } from "recharts";
export const ChartBox = () => {
  const data = [
    {
      name: "January",
      pointsEarned: 4000,
      pointsSpent: 2400,
      amt: 2400,
    },
    {
      name: "February",
      pointsEarned: 3000,
      pointsSpent: 1398,
      amt: 2210,
    },
    {
      name: "March",
      pointsEarned: 2000,
      pointsSpent: 9800,
      amt: 2290,
    },
    {
      name: "April",
      pointsEarned: 2780,
      pointsSpent: 3908,
      amt: 2000,
    },
    {
      name: "May",
      pointsEarned: 1890,
      pointsSpent: 4800,
      amt: 2181,
    },
    {
      name: "June",
      pointsEarned: 2390,
      pointsSpent: 3800,
      amt: 2500,
    },
    {
      name: "July",
      pointsEarned: 3490,
      pointsSpent: 4300,
      amt: 2100,
    },
    {
      name: "August",
      pointsEarned: 3490,
      pointsSpent: 4300,
      amt: 2100,
    },
    {
      name: "September",
      pointsEarned: 3490,
      pointsSpent: 4300,
      amt: 2100,
    },
    {
      name: "October",
      pointsEarned: 3490,
      pointsSpent: 4300,
      amt: 2100,
    },
    {
      name: "November",
      pointsEarned: 3490,
      pointsSpent: 4300,
      amt: 2100,
    },
    {
      name: "December",
      pointsEarned: 3490,
      pointsSpent: 4300,
      amt: 2100,
    },
  ];
  return (
    <>
      <div className="chartBox">
        <div className="boxInfo">
          <div className="title">
            <img src="/user.svg" alt="" />
            <span>Total Users</span>
          </div>

          <h1>10</h1>
          <Link to="/DriverManagement">"View users"</Link>
          <div className="chartInfo">
            <div className="chart"></div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={300}
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="pointsEarned"
                  fill="#8884d8"
                  activeBar={<Rectangle fill="pink" stroke="blue" />}
                />
                <Bar
                  dataKey="pointsSpent"
                  fill="#82ca9d"
                  activeBar={<Rectangle fill="gold" stroke="purple" />}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="texts"></div>
          </div>
        </div>
      </div>
    </>
  );
};
