import React, { useState } from "react";
import {
  Button, Select, MenuItem, FormControl, InputLabel, TextField, Card,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const REPORTS_URL = "https://8y9n1ik5pc.execute-api.us-east-1.amazonaws.com/dev1";

async function getSpecificPointChnages(startDate: string, endDate: string, driverEmail: string) {
  try {
    const response = await fetch(`${REPORTS_URL}/pointChanges?StartDate=${startDate}&EndDate=${endDate}&DriverEmail=${driverEmail}`);
    if (!response.ok) throw new Error("Failed to fetch point changes");
    return await response.json();
  } catch (error) {
    console.error("Error fetching point changes:", error);
    return [];
  }
}

async function getAllPointChanges(startDate: string, endDate: string) {
  try {
    const response = await fetch(`${REPORTS_URL}/pointChanges?StartDate=${startDate}&EndDate=${endDate}`);
    if (!response.ok) throw new Error("Failed to fetch point changes");
    return await response.json();
  } catch (error) {
    console.error("Error fetching point changes:", error);
    return [];
  }
}

async function getDriverApplications(startDate: string, endDate: string, sponsorId: string) {
  try {
    const response = await fetch(`${REPORTS_URL}/driverApplications?StartDate=${startDate}&EndDate=${endDate}&SponsorID=${sponsorId}`);
    if (!response.ok) throw new Error("Failed to fetch driver applications");
    return await response.json();
  } catch (error) {
    console.error("Error fetching driver applications:", error);
    return [];
  }
}

const sampleData = [
  {
    PointChangeDriver: 'jrbrany@clemson.edu',
    PointChangeSponsor: 'jrbrany+s@clemson.edu',
    PointChangeNumber: '5.00',
    PointChangeAction: 'Subtract',
    PointChangeDate: '2025-03-31T00:00:00.000Z'
  }
];

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState("All Driver Point Changes");
  const [viewMode, setViewMode] = useState("table");
  const [reportData, setReportData] = useState<any[]>(sampleData);
  const [startDate, setStartDate] = useState("2000-01-01");
  const [endDate, setEndDate] = useState("3000-01-01");
  const [sponsorId, setSponsorId] = useState("3");

  const generateReport = async () => {
    let data: any[] = [];

    switch (selectedReport) {
      case "All Driver Point Changes":
        data = await getAllPointChanges(startDate, endDate);
        data = data[0];
        break;
      case "Specific Driver Point Changes":
        data = await getSpecificPointChnages(startDate, endDate, "jrbrany@clemson.edu");
        data = data[0];
        break;
      case "Driver Applications":
        data = await getDriverApplications(startDate, endDate, sponsorId);
        data = data[0];
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

  const renderTableHeaders = () => {
    if (selectedReport === "Driver Applications") {
      return (
        <TableRow>
          <TableCell>Driver</TableCell>
          <TableCell>Sponsor</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Date Submitted</TableCell>
          <TableCell>Reason</TableCell>
        </TableRow>
      );
    } else {
      return (
        <TableRow>
          <TableCell>PointChangeDriver</TableCell>
          <TableCell>PointChangeSponsor</TableCell>
          <TableCell>PointChangeNumber</TableCell>
          <TableCell>PointChangeAction</TableCell>
          <TableCell>PointChangeDate</TableCell>
        </TableRow>
      );
    }
  };

  const renderTableRows = () => {
    if (!reportData || !Array.isArray(reportData)) return null;

    if (selectedReport === "Driver Applications") {
      return reportData.map((item, index) => (
        <TableRow key={index}>
          <TableCell>{item.ApplicationDriver}</TableCell>
          <TableCell>{item.ApplicationOrganization}</TableCell>
          <TableCell>{item.ApplicationStatus}</TableCell>
          <TableCell>{item.ApplicationDateSubmitted}</TableCell>
          <TableCell>{item.ApplicationReason}</TableCell>
        </TableRow>
      ));
    } else {
      return reportData.map((item, index) => (
        <TableRow key={index}>
          <TableCell>{item.PointChangeDriver}</TableCell>
          <TableCell>{item.PointChangeSponsor}</TableCell>
          <TableCell>{item.PointChangeNumber}</TableCell>
          <TableCell>{item.PointChangeAction}</TableCell>
          <TableCell>{item.PointChangeDate}</TableCell>
        </TableRow>
      ));
    }
  };

  return (
    <div className="p-6">
      <br />
      <br />
      <br />
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <FormControl>
          <InputLabel>Report</InputLabel>
          <Select value={selectedReport} onChange={(e: React.ChangeEvent<{ value: unknown }>) => setSelectedReport(e.target.value as string)}>
            <MenuItem value="All Driver Point Changes">All Driver Point Changes</MenuItem>
            <MenuItem value="Specific Driver Point Changes">Specific Driver Point Changes</MenuItem>
            <MenuItem value="Driver Applications">Driver Applications</MenuItem>
            <MenuItem value="Sales By Driver">Sales By Driver</MenuItem>
            <MenuItem value="Sales By Sponsor">Sales By Sponsor</MenuItem>
            <MenuItem value="Invoice">Invoice</MenuItem>
          </Select>
        </FormControl>

        {selectedReport === "Driver Applications" && (
          <>
            <TextField
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
            />
            <TextField
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
            />
            <TextField
              label="Sponsor ID"
              type="number"
              value={sponsorId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSponsorId(e.target.value)}
            />
          </>
        )}

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
                <TableHead>{renderTableHeaders()}</TableHead>
                <TableBody>{renderTableRows()}</TableBody>
              </Table>
            </TableContainer>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData}>
                <XAxis dataKey="PointChangeDriver" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="PointChangeNumber" />
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
