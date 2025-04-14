import "./chartBox.css";
import { Bar, BarChart, Cell, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { CartesianGrid, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

interface DriverInfo {
  DriversEmail: string;
  DriversSponsorID: number;
  DriversPoints: string;
  DailyPoints: string;
}

interface Props {
  SponsorID: string;
}

export const ChartBox = ({ SponsorID }: Props) => {
  const sponsorDriverUrl =
    "https://obf2ta0gw9.execute-api.us-east-1.amazonaws.com/dev1";

  const [driverInfo, setDriverInfo] = useState<DriverInfo[]>([]);

  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#8dd1e1",
    "#a4de6c",
  ];

  useEffect(() => {
    const fetchOrganizations = async (): Promise<void> => {
      try {
        const response = await fetch(
          `${sponsorDriverUrl}/driverssponsors?DriversSponsorID=${SponsorID}`
        );

        const data: DriverInfo[] = await response.json();

        setDriverInfo(data);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    };

    fetchOrganizations();
  }, []);

  const topDrivers = [...driverInfo]
    .sort((a, b) => Number(b.DriversPoints) - Number(a.DriversPoints))
    .slice(0, 5);

  const chartData = topDrivers.map((driver) => ({
    DriversEmail: driver.DriversEmail,
    DriversPoints: Number(driver.DriversPoints),
  }));

  return (
    <>
      <div className="chartBox">
        <div className="boxInfo">
          <div className="title">
            <img src="/images/DefaultOrg.jpg" alt="" />
            <span>Current Point Leaders</span>
          </div>

          <div className="chartInfo">
            <div className="chart"></div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                width={500}
                height={300}
                data={chartData}
                margin={{
                  top: 5,
                  right: 0,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="DriversEmail"
                  interval={0}
                  tickFormatter={(email: string) => email.split("@")[0]}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="DriversPoints">
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="texts"></div>
          </div>
        </div>
      </div>
    </>
  );
};
