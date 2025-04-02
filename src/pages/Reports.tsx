import React, { useState } from "react";
import { Button, Select, MenuItem, FormControl, InputLabel, Card } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

//const REPORTS_URL = "https://8y9n1ik5pc.execute-api.us-east-1.amazonaws.com/dev1"
/*
async function getAllPointChanges(startDate: string, endDate: string) {
    try {
        const response = await fetch(`${REPORTS_URL}/pointChanges?StartDate=${startDate}&EndDate=${endDate}`);
        if (!response.ok) throw new Error("Failed to fetch point changes");
        return await response.json();
    } catch (error) {
        console.error("Error fetching organizations:", error);
        return [];
    }
}

async function getSpecificPointChnages(startDate: string, endDate: string, driverEmail: string) {
    try {
        const response = await fetch(`${REPORTS_URL}/pointChanges?StartDate=${startDate}&EndDate=${endDate}&DriverEmail=${driverEmail}`);
        if (!response.ok) throw new Error("Failed to fetch point changes");
        return await response.json();
    } catch (error) {
        console.error("Error fetching organizations:", error);
        return [];
    }
}

const sampleDataTest = getAllPointChanges("2000-01-01", "3000-01-01");


async function getAllPointChanges(startDate, endDate) {
    try {
        const response = await fetch(`${REPORTS_URL}/pointChanges?StartDate=${startDate}&EndDate=${endDate}`);
        if (!response.ok) throw new Error("Failed to fetch point changes");
        return await response.json();
    } catch (error) {
        console.error("Error fetching organizations:", error);
        return [];
    }
}
*/

const sampleData = [
    {
        PointChangeDriver: 'jrbrany@clemson.edu',
        PointChangeSponsor: 'jrbrany+s@clemson.edu',
        PointChangeNumber: '5.00',
        PointChangeAction: 'Subtract',
        PointChangeDate: '2025-03-31T00:00:00.000Z'
    }
];

const sampleData2 = [
    {
        PointChangeDriver: 'jrbrany@clemson.edu',
        PointChangeSponsor: 'jrbrany+s@clemson.edu',
        PointChangeNumber: '10.00',
        PointChangeAction: 'Subtract',
        PointChangeDate: '2025-03-31T00:00:00.000Z'
    }
];

const sampleData3 = [
    {
        PointChangeDriver: 'hayjroof@gmail.com',
        PointChangeSponsor: 'haydenjroof+25@gmail.com',
        PointChangeNumber: '100.00',
        PointChangeAction: 'Set',
        PointChangeDate: '2025-03-24T00:00:00.000Z'
      },
];
  
  const sampleData4 = [
    {
        PointChangeDriver: 'testEmail@email.com',
        PointChangeSponsor: 'sponsortest@email.com',
        PointChangeNumber: '10.00',
        PointChangeAction: 'Subtract',
        PointChangeDate: '2025-03-11T00:00:00.000Z'
    }
 ];

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState("All Driver Point Changes");
  const [viewMode, setViewMode] = useState("table");
  const [reportData, setReportData] = useState(sampleData);

  const generateReport = () => {
    let data;
    switch (selectedReport) {
      case "All Driver Point Changes":
        data = sampleData;
        break;
      case "Specific Driver Point Changes":
        data = sampleData2;
        break;
      case "Sales By Driver":
        data = sampleData3;
        break;
      case "Sales By Sponsor":
        data = sampleData4;
        break;
      case "Invoice":
        data = sampleData4;
        break;
      default:
        data = sampleData;
    }
    setReportData(data);
  };

  const downloadPDF = async () => {
    const element = document.getElementById("report-content");
    if (element) {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 10, 10, 180, 0);
      pdf.save("report.pdf");
    }
  };

  return (
    <div className="p-6">
        <br />
        <br /> 
        <br />
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <div className="flex items-center gap-4 mb-4">
        <FormControl>
          <InputLabel>Report</InputLabel>
          <Select value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)}>
            <MenuItem value="All Driver Point Changes">All Driver Point Changes</MenuItem>
            <MenuItem value="Specific Driver Point Changes">Specific Driver Point Changes</MenuItem>
            <MenuItem value="Sales By Driver">Sales By Driver</MenuItem>
            <MenuItem value="Sales By Sponsor">Sales By Sponsor</MenuItem>
            <MenuItem value="Invoice">Invoice</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={generateReport}>Generate</Button>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <Button variant={viewMode === "table" ? "contained" : "outlined"} onClick={() => setViewMode("table")}>Table</Button>
        <Button variant={viewMode === "chart" ? "contained" : "outlined"} onClick={() => setViewMode("chart")}>Chart</Button>
      </div>
      <Card>
        <div id="report-content" className="p-4">
          {viewMode === "table" ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>PointChangeDriver</TableCell>
                    <TableCell>PointChangeSponsor</TableCell>
                    <TableCell>PointChangeNumber</TableCell>
                    <TableCell>PointChangeAction</TableCell>
                    <TableCell>PointChangeDate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.PointChangeDriver}</TableCell>
                      <TableCell>{item.PointChangeSponsor}</TableCell>
                      <TableCell>{item.PointChangeNumber}</TableCell>
                      <TableCell>{item.PointChangeAction}</TableCell>
                      <TableCell>{item.PointChangeDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData}>
                <XAxis dataKey="driver" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pointChange" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
      <Button className="mt-4" variant="contained" onClick={downloadPDF}>Download PDF</Button>
    </div>
  );
};

export default Reports;