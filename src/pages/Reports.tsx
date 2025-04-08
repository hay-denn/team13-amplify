import React, { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context"; // *** ADDED: for sponsor org logic
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
const SPONSOR_BASE_URL = "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1";

// ===================== API CALLS =====================
async function getPointChanges(startDate?: string, endDate?: string, driverEmail?: string /* maybe sponsorId here if needed? */) {
  const url = new URL(`${REPORTS_URL}/pointChanges`);
  if (startDate && startDate.trim() !== "") url.searchParams.append("StartDate", startDate);
  if (endDate && endDate.trim() !== "") url.searchParams.append("EndDate", endDate);
  if (driverEmail && driverEmail.trim() !== "") url.searchParams.append("DriverEmail", driverEmail);
  // If the API supported sponsor ID, you'd do url.searchParams.append("SponsorID", sponsorId);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      throw new Error("Failed to fetch point changes");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching point changes:", error);
    return [];
  }
}

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
    return data;
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
    return await response.json();
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
    return await response.json();
  } catch (error) {
    console.error("Error fetching login attempts:", error);
    return [];
  }
}

async function getPurchaseData(
  startDate?: string,
  endDate?: string,
  sponsorId?: string,
  driverEmail?: string
) {
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
      throw new Error("Failed to fetch purchases");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return [];
  }
}

const Reports: React.FC = () => {
  const auth = useAuth(); // *** ADDED
  const [selectedReport, setSelectedReport] = useState("Driver Point Changes");
  const [viewMode, setViewMode] = useState("table");
  const [reportData, setReportData] = useState<any[]>([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sponsorId, setSponsorId] = useState("");     // existing field
  const [driverEmail, setDriverEmail] = useState("");

  // *** ADDED/CHANGED: track sponsor's Org ID
  const [sponsorOrgID, setSponsorOrgID] = useState<string | null>(null);
  const [isSponsor, setIsSponsor] = useState<boolean>(false); // or however you detect sponsor roles

  // ================================================
  // 1) FETCH THE SPONSOR'S ORG IF THE USER IS SPONSOR
  // ================================================
  useEffect(() => {
    // If you have a better way to detect sponsor vs. admin vs. driver, do that here:
    // e.g. check claims, roles, or your own logic
    const role = auth.user?.profile?.role; // or however you store it
    if (role === "Sponsor") {
      setIsSponsor(true);
    }
  }, [auth.user]);

  useEffect(() => {
    const fetchSponsorOrg = async () => {
      if (!auth.user || !auth.user.profile?.email) return;

      try {
        const response = await fetch(
          `${SPONSOR_BASE_URL}/sponsor?UserEmail=${encodeURIComponent(auth.user?.profile?.email || "")}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch sponsor: ${response.status}`);
        }
        const data = await response.json();
        let sponsor;
        // data might be an array or object
        if (Array.isArray(data)) {
          sponsor = data.find((s: any) => s.UserEmail === auth.user?.profile?.email);
        } else {
          sponsor = data;
        }
        if (sponsor && sponsor.UserOrganization) {
          setSponsorOrgID(sponsor.UserOrganization);
        }
      } catch (error) {
        console.error("Error fetching sponsor organization:", error);
      }
    };

    if (isSponsor) {
      fetchSponsorOrg();
    }
  }, [auth.user, isSponsor]);

  // ================================================
  // 2) GENERATE THE REPORT
  // ================================================
  const generateReport = async () => {
    let data: any[] = [];

    // If user is sponsor, we can override sponsorId with sponsorOrgID from DB
    let finalSponsorId = sponsorId; 
    if (isSponsor && sponsorOrgID) {
      finalSponsorId = sponsorOrgID; // *** FORCES THE API CALL TO USE SPONSOR’S ORG ID
    }

    switch (selectedReport) {
      case "Driver Point Changes":
        data = await getPointChanges(startDate, endDate, driverEmail);
        // The pointChanges API does NOT currently take SponsorID param:
        // If you need to filter by sponsor, you can do it manually below:
        if (isSponsor && sponsorOrgID) {
          // E.g., if data objects have some sponsor org info, you can filter:
          data = data.filter((item) => {
            // item might have item.PointChangeSponsor or an org field
            // If your DB tracks sponsor org somewhere, check that field:
            return item.PointChangeSponsorOrgID === sponsorOrgID;
            // or item.PointChangeSponsor === auth.user.profile.email
          });
        }

        if (Array.isArray(data) && Array.isArray(data[0])) {
          data = data[0];
        }
        break;

      case "Driver Applications":
        data = await getDriverApplications(startDate, endDate, finalSponsorId, driverEmail);
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
        data = await getPurchaseData(startDate, endDate, finalSponsorId, driverEmail);
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

    setReportData(data);
  };

  // ================================================
  // 3) DOWNLOAD PDF OR CSV
  // ================================================
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
    const rows = reportData.map((item) =>
      Object.values(item)
        .map((value) => `"${value}"`)
        .join(",")
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
    URL.revokeObjectURL(url);
  };

  // ================================================
  // 4) RENDER HELPERS
  // ================================================
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
      // If you had any other fallback
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
          <TableCell>
            {item.success === 1 ? "Success" : item.success === 0 ? "Failed" : item.success}
          </TableCell>
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
      // fallback
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
    // If user is sponsor, you can hide the sponsorId field if you only want to show their org
    // or else keep it visible if you want them to override. Adjust as needed.
    const hideSponsorIdField =
      (selectedReport === "Driver Applications" || selectedReport === "Purchases") && isSponsor;

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
          {(selectedReport === "Driver Applications" || selectedReport === "Purchases") && !hideSponsorIdField && (
            <TextField
              label="Sponsor ID"
              type="text"
              value={sponsorId}
              onChange={(e) => setSponsorId(e.target.value)}
            />
          )}
          <TextField
            label={
              selectedReport === "Password Change Logs" || selectedReport === "Login Attempts Logs"
                ? "User Email"
                : "Driver Email"
            }
            type="email"
            value={driverEmail}
            onChange={(e) => setDriverEmail(e.target.value)}
          />
        </div>
      );
    }
    return null;
  };

  // ================================================
  // 5) COMPONENT RENDER
  // ================================================
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <FormControl>
          <InputLabel>Report</InputLabel>
          <Select value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)}>
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
