import React, { useState } from "react";
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const REPORTS_URL = "https://8y9n1ik5pc.execute-api.us-east-1.amazonaws.com/dev1";

// Point Changes API using stored procedure with optional filters
async function getPointChanges(startDate?: string, endDate?: string, driverEmail?: string) {
  const url = new URL(`${REPORTS_URL}/pointChanges`);
  if (startDate && startDate.trim() !== "") url.searchParams.append("StartDate", startDate);
  if (endDate && endDate.trim() !== "") url.searchParams.append("EndDate", endDate);
  if (driverEmail && driverEmail.trim() !== "") url.searchParams.append("DriverEmail", driverEmail);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      throw new Error("Failed to fetch point changes");
    }
    const data = await response.json();
    data.forEach((item: any) => console.log("Point Change Data:", item));
    return await data;
  } catch (error) {
    console.error("Error fetching point changes:", error);
    return [];
  }
}

// Driver Applications API using stored procedure with optional filters
async function getDriverApplications(
  startDate?: string,
  endDate?: string,
  sponsorId?: string,
  driverEmail?: string
) {
  const url = new URL(`${REPORTS_URL}/driverApplications`);
  if (startDate && startDate.trim() !== "") url.searchParams.append("StartDate", startDate);
  if (endDate && endDate.trim() !== "") url.searchParams.append("EndDate", endDate);
  if (sponsorId && sponsorId.trim() !== "") url.searchParams.append("SponsorID", sponsorId);
  if (driverEmail && driverEmail.trim() !== "") url.searchParams.append("DriverEmail", driverEmail);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      throw new Error("Failed to fetch driver applications");
    }
    const data = await response.json();
    data.forEach((item: any) => console.log("Driver Application Data:", item));
    return await data;
  } catch (error) {
    console.error("Error fetching driver applications:", error);
    return [];
  }
}

async function getPasswordChanges(startDate?: string, endDate?: string, userEmail?: string) {
  const url = new URL(`${REPORTS_URL}/passwordChanges`);
  if (startDate && startDate.trim() !== "") url.searchParams.append("StartDate", startDate);
  if (endDate && endDate.trim() !== "") url.searchParams.append("EndDate", endDate);
  if (userEmail && userEmail.trim() !== "") url.searchParams.append("UserEmail", userEmail);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      throw new Error("Failed to fetch password change logs");
    }
    const data = await response.json();
    data.forEach((item: any) => console.log("Password Change Data:", item));
    return await data;
  } catch (error) {
    console.error("Error fetching password changes:", error);
    return [];
  }
}

async function getLoginAttempts(startDate?: string, endDate?: string, userEmail?: string) {
  const url = new URL(`${REPORTS_URL}/loginAttempts`);
  if (startDate && startDate.trim() !== "") url.searchParams.append("StartDate", startDate);
  if (endDate && endDate.trim() !== "") url.searchParams.append("EndDate", endDate);
  if (userEmail && userEmail.trim() !== "") url.searchParams.append("UserEmail", userEmail);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      throw new Error("Failed to fetch login attempts");
    }
    const data = await response.json();
    data.forEach((item: any) => console.log("Login Attempt Data:", item));
    return data;
  } catch (error) {
    console.error("Error fetching login attempts:", error);
    return [];
  }
}

async function getPurchaseData(startDate?: string, endDate?: string, sponsorId?: string, driverEmail?: string) {
    const url = new URL(`${REPORTS_URL}/purchases`);
    if (startDate && startDate.trim() !== "") url.searchParams.append("StartDate", startDate);
    if (endDate && endDate.trim() !== "") url.searchParams.append("EndDate", endDate);
    if (sponsorId && sponsorId.trim() !== "") url.searchParams.append("SponsorID", sponsorId);
    if (driverEmail && driverEmail.trim() !== "") url.searchParams.append("DriverEmail", driverEmail);
  
    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error("Failed to fetch point changes");
      }
      const data = await response.json();
      data.forEach((item: any) => console.log("Purchases Data:", item));
      return await data;
    } catch (error) {
      console.error("Error fetching point changes:", error);
      return [];
    }
  }

  async function getDriversForSponsor(sponsorId: string) {
    const url = new URL("https://vnduk955ek.execute-api.us-east-1.amazonaws.com/dev1/driverssponsors");
    if (sponsorId && sponsorId.trim() !== "") {
      url.searchParams.append("DriversSponsorID", sponsorId);
    }
    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        throw new Error("Failed to fetch drivers for sponsor");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching drivers for sponsor:", error);
      return [];
    }
  }

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState("Driver Point Changes");
  const [viewMode, setViewMode] = useState("table");
  const [reportData, setReportData] = useState<any[]>([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sponsorId, setSponsorId] = useState("");
  const [driverEmail, setDriverEmail] = useState("");

  const generateReport = async () => {
    let data: any[] = [];
  
    switch (selectedReport) {
      case "Driver Point Changes":
        data = await getPointChanges(startDate, endDate, driverEmail);
        if (Array.isArray(data) && Array.isArray(data[0])) {
          data = data[0];
        }
        break;
      case "Driver Applications":
        data = await getDriverApplications(startDate, endDate, sponsorId, driverEmail);
        if (Array.isArray(data) && Array.isArray(data[0])) {
          data = data[0];
        }
        break;
      case "Password Change Logs":
        data = await getPasswordChanges(startDate, endDate, driverEmail);
        break;
      case "Login Attempts Logs":
        data = await getLoginAttempts(startDate, endDate, driverEmail);
        break;
      case "Purchases":
        data = await getPurchaseData(startDate, endDate, sponsorId, driverEmail);
        if (Array.isArray(data) && Array.isArray(data[0])) {
          data = data[0];
        }
        break;
      default:
        data = [];
        break;
    }
  
    if (!Array.isArray(data)) {
      console.error("Unexpected API response format:", data);
      data = [];
    }

    if (sponsorId.trim() !== "") {
      const drivers = await getDriversForSponsor(sponsorId);
      console.log("Drivers for Sponsor:", drivers);
      const allowedEmails = drivers.map((d: any) => d.DriverEmail);
      console.log("Allowed Emails:", allowedEmails);

      let filterKey = "";
      if (selectedReport === "Driver Applications") {
        filterKey = "ApplicationDriver";
      } else if (selectedReport === "Purchases") {
        filterKey = "PurchaseDriver";
      } else if (selectedReport === "Driver Point Changes") {
        filterKey = "PointChangeDriver";
      } else if (selectedReport === "Password Change Logs") {
        filterKey = "user";
      } else if (selectedReport === "Login Attempts Logs") {
        filterKey = "user";
      }

      if (filterKey) {
        data = data.filter((item) => allowedEmails.includes(item[filterKey]));
      }
    }
    console.log("Fetched data:", data);
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

  const downloadCSV = () => {
    if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
        console.error("No data available for CSV download.");
        return;
    }
    
    // Extract headers from the first data object
    const headers = Object.keys(reportData[0]).join(",");
    
    // Generate rows
    const rows = reportData.map(item =>
        Object.values(item).map(value => `"${value}"`).join(",")
    );
    
    // Combine headers and rows into CSV format
    const csvContent = [headers, ...rows].join("\n");
    
    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "report.csv";
    link.click();
    URL.revokeObjectURL(url); // Clean up
  };

  const renderTableHeaders = () => {
    if (selectedReport === "Driver Applications") {
      return (
        <TableRow>
          <TableCell>Driver</TableCell>
          <TableCell>Sponsor</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Date</TableCell>
          <TableCell>Reason</TableCell>
        </TableRow>
      );
    } else if (selectedReport === "Driver Point Changes") {
      return (
        <TableRow>
          <TableCell>Driver</TableCell>
          <TableCell>Sponsor</TableCell>
          <TableCell>Points Gained/Removed</TableCell>
          <TableCell>Date</TableCell>
          <TableCell>Reason</TableCell>
        </TableRow>
      );
    } else if (selectedReport === "Password Change Logs") {
      return (
        <TableRow>
          <TableCell>User Email</TableCell>
          <TableCell>Change Type</TableCell>
          <TableCell>Change Date</TableCell>
        </TableRow>
      );
    } else if (selectedReport === "Login Attempts Logs") {
        return (
        <TableRow>
            <TableCell>User Email</TableCell>
            <TableCell>Attempt Date</TableCell>
            <TableCell>Status</TableCell>
        </TableRow>
        );
    } else if (selectedReport === "Purchases") {
        return (
          <TableRow>
            <TableCell>PurchaseDriver</TableCell>
            <TableCell>OrganizationName</TableCell>
            <TableCell>PurchaseDate</TableCell>
            <TableCell>PurchaseStatus</TableCell>
          </TableRow>
        );
    } else {
        return (
        <TableRow>
            <TableCell>Purchase Driver</TableCell>
            <TableCell>Purchase Price</TableCell>
            <TableCell>Purchase Date</TableCell>
            <TableCell>Purchase Status</TableCell>
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
    } else if (selectedReport === "Driver Point Changes") {
      return reportData.map((item, index) => (
        <TableRow key={index}>
          <TableCell>{item.PointChangeDriver}</TableCell>
          <TableCell>{item.PointChangeSponsor}</TableCell>
          <TableCell>{item.PointChangeNumber}</TableCell>
          <TableCell>{item.PointChangeDate}</TableCell>
          <TableCell>{item.PointChangeReason}</TableCell>
        </TableRow>
      ));
    } else if (selectedReport === "Password Change Logs") {
      return reportData.map((item, index) => (
        <TableRow key={index}>
          <TableCell>{item.user}</TableCell>
          <TableCell>{item.changeType}</TableCell>
          <TableCell>{item.changeDate}</TableCell>
        </TableRow>
      ));
    } else if (selectedReport === "Login Attempts Logs") {
      return reportData.map((item, index) => (
        <TableRow key={index}>
          <TableCell>{item.user}</TableCell>
          <TableCell>{item.loginDate}</TableCell>
          <TableCell>{item.success === 1 ? "Success" : item.success === 0 ? "Failed" : item.success}</TableCell>
        </TableRow>
      )); 
    } else if (selectedReport === "Purchases") {
      return reportData.map((item, index) => (
        <TableRow key={index}>
           <TableCell>{item.PurchaseDriver}</TableCell>
           <TableCell>{item.OrganizationName}</TableCell>
           <TableCell>{item.PurchaseDate}</TableCell>
           <TableCell>{item.PurchaseStatus}</TableCell>
        </TableRow>
        ));
    } else {
        return reportData.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{item.PurchaseDriver}</TableCell>
            <TableCell>{item.PurchasePrice}</TableCell>
            <TableCell>{item.PurchaseDate}</TableCell>
            <TableCell>{item.PurchaseStatus}</TableCell>
          </TableRow>
        ));
    }
  };

  const renderFilters = () => {
    if (
      selectedReport === "Driver Point Changes" ||
      selectedReport === "Driver Applications" ||
      selectedReport === "Password Change Logs" ||
      selectedReport === "Purchases" ||
      selectedReport === "Login Attempts Logs"
    ) {
      return (
        <div className="flex flex-col gap-4 mb-4">
          <TextField
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <TextField
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          {(selectedReport === "Driver Applications" || selectedReport === "Purchases") && (
            <TextField
              label="Sponsor ID"
              type="number"
              value={sponsorId}
              onChange={(e) => setSponsorId(e.target.value)}
            />
          )}
          <TextField
            label={(selectedReport === "Password Change Logs" || selectedReport === "Login Attempts Logs") ? "User Email" : "Driver Email"}
            type="email"
            value={driverEmail}
            onChange={(e) => setDriverEmail(e.target.value)}
          />
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <FormControl>
          <InputLabel>Report</InputLabel>
          <Select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
          >
            <MenuItem value="Driver Point Changes">Driver Point Changes</MenuItem>
            <MenuItem value="Driver Applications">Driver Applications</MenuItem>
            <MenuItem value="Password Change Logs">Password Change Logs</MenuItem>
            <MenuItem value="Login Attempts Logs">Login Attempts Logs</MenuItem>
            <MenuItem value="Purchases">Purchases</MenuItem>
            <MenuItem value="Invoice">Invoice</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={generateReport}>
          Generate
        </Button>
      </div>

      {renderFilters()}

      <div className="flex items-center gap-4 mb-4">
        <Button
          variant={viewMode === "table" ? "contained" : "outlined"}
          onClick={() => setViewMode("table")}
        >
          Table
        </Button>
        <Button
          variant={viewMode === "chart" ? "contained" : "outlined"}
          onClick={() => setViewMode("chart")}
        >
          Chart
        </Button>
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

      <Button className="mt-4 mx-2" variant="contained" onClick={downloadPDF}>
        Download PDF
      </Button>
      <Button className="mt-4 mx-2" variant="contained" onClick={downloadCSV}>
        Download CSV
      </Button>
    </div>
  );
};

export default Reports;
