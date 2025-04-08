import React, { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
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
const SPONSOR_DRIVERS_URL = "https://vnduk955ek.execute-api.us-east-1.amazonaws.com/dev1";

async function getPointChanges(
  startDate?: string | number,
  endDate?: string | number,
  driverEmail?: string | number
): Promise<any[]> {
  const url = new URL(`${REPORTS_URL}/pointChanges`);
  if (startDate && String(startDate).trim() !== "") {
    url.searchParams.append("StartDate", String(startDate));
  }
  if (endDate && String(endDate).trim() !== "") {
    url.searchParams.append("EndDate", String(endDate));
  }
  if (driverEmail && String(driverEmail).trim() !== "") {
    url.searchParams.append("DriverEmail", String(driverEmail));
  }
  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      await response.text();
      return [];
    }
    return await response.json();
  } catch (error) {
    return [];
  }
}

async function getDriverApplications(
  startDate?: string | number,
  endDate?: string | number,
  sponsorId?: string | number,
  driverEmail?: string | number
): Promise<any[]> {
  const url = new URL(`${REPORTS_URL}/driverApplications`);
  if (startDate && String(startDate).trim() !== "") {
    url.searchParams.append("StartDate", String(startDate));
  }
  if (endDate && String(endDate).trim() !== "") {
    url.searchParams.append("EndDate", String(endDate));
  }
  if (sponsorId && String(sponsorId).trim() !== "") {
    url.searchParams.append("SponsorID", String(sponsorId));
  }
  if (driverEmail && String(driverEmail).trim() !== "") {
    url.searchParams.append("DriverEmail", String(driverEmail));
  }
  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      await response.text();
      return [];
    }
    return await response.json();
  } catch (error) {
    return [];
  }
}

async function getPasswordChanges(
  startDate?: string | number,
  endDate?: string | number,
  userEmail?: string | number
): Promise<any[]> {
  const url = new URL(`${REPORTS_URL}/passwordChanges`);
  if (startDate && String(startDate).trim() !== "") {
    url.searchParams.append("StartDate", String(startDate));
  }
  if (endDate && String(endDate).trim() !== "") {
    url.searchParams.append("EndDate", String(endDate));
  }
  if (userEmail && String(userEmail).trim() !== "") {
    url.searchParams.append("UserEmail", String(userEmail));
  }
  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      await response.text();
      return [];
    }
    return await response.json();
  } catch (error) {
    return [];
  }
}

async function getLoginAttempts(
  startDate?: string | number,
  endDate?: string | number,
  userEmail?: string | number
): Promise<any[]> {
  const url = new URL(`${REPORTS_URL}/loginAttempts`);
  if (startDate && String(startDate).trim() !== "") {
    url.searchParams.append("StartDate", String(startDate));
  }
  if (endDate && String(endDate).trim() !== "") {
    url.searchParams.append("EndDate", String(endDate));
  }
  if (userEmail && String(userEmail).trim() !== "") {
    url.searchParams.append("UserEmail", String(userEmail));
  }
  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      await response.text();
      return [];
    }
    return await response.json();
  } catch (error) {
    return [];
  }
}

async function getPurchaseData(
  startDate?: string | number,
  endDate?: string | number,
  sponsorId?: string | number,
  driverEmail?: string | number
): Promise<any[]> {
  const url = new URL(`${REPORTS_URL}/purchases`);
  if (startDate && String(startDate).trim() !== "") {
    url.searchParams.append("StartDate", String(startDate));
  }
  if (endDate && String(endDate).trim() !== "") {
    url.searchParams.append("EndDate", String(endDate));
  }
  if (sponsorId && String(sponsorId).trim() !== "") {
    url.searchParams.append("SponsorID", String(sponsorId));
  }
  if (driverEmail && String(driverEmail).trim() !== "") {
    url.searchParams.append("DriverEmail", String(driverEmail));
  }
  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      await response.text();
      return [];
    }
    return await response.json();
  } catch (error) {
    return [];
  }
}

async function getInvoices(
    startDate?: string | number,
    endDate?: string | number,
    sponsorId?: string | number
  ): Promise<any[]> {
    const url = new URL(`${REPORTS_URL}/purchases`);
    if (startDate && String(startDate).trim() !== "") {
      url.searchParams.append("StartDate", String(startDate));
    }
    if (endDate && String(endDate).trim() !== "") {
      url.searchParams.append("EndDate", String(endDate));
    }
    if (sponsorId && String(sponsorId).trim() !== "") {
      url.searchParams.append("SponsorID", String(sponsorId));
    }
    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        await response.text();
        return [];
      }
      return await response.json();
    } catch (error) {
      return [];
    }
  }

async function getSponsorDrivers(sponsorOrgID: string | number): Promise<string[]> {
  const url = new URL(`${SPONSOR_DRIVERS_URL}/driverssponsors`);
  url.searchParams.append("DriversSponsorID", String(sponsorOrgID));
  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      await response.text();
      return [];
    }
    const data = await response.json();
    return data.map((item: any) => item.DriversEmail);
  } catch (error) {
    return [];
  }
}

const Reports: React.FC = () => {
  const auth = useAuth();
  const [isSponsor, setIsSponsor] = useState<boolean>(false);
  useEffect(() => {
    const maybeGroups = auth.user?.profile?.["cognito:groups"];
    const groups = Array.isArray(maybeGroups) ? maybeGroups : [];
    setIsSponsor(groups.includes("Sponsor"));
  }, [auth.user]);
  const [sponsorOrgID, setSponsorOrgID] = useState<string | null>(null);
  const [driverEmails, setDriverEmails] = useState<string[]>([]);
  useEffect(() => {
    if (!isSponsor || !auth.user?.profile?.email) return;
    const fetchSponsorOrg = async () => {
      try {
        const sponsorEmail = encodeURIComponent(auth.user?.profile?.email || "");
        const url = `${SPONSOR_BASE_URL}/sponsor?UserEmail=${sponsorEmail}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch sponsor: ${response.status}`);
        const data = await response.json();
        let sponsor = Array.isArray(data)
          ? data.find((s: any) => s.UserEmail === auth.user?.profile?.email)
          : data;
        if (sponsor && sponsor.UserOrganization) {
          setSponsorOrgID(String(sponsor.UserOrganization));
        }
      } catch (error) {}
    };
    fetchSponsorOrg();
  }, [isSponsor, auth.user]);
  useEffect(() => {
    if (!sponsorOrgID) return;
    const fetchDrivers = async () => {
      const emails = await getSponsorDrivers(sponsorOrgID);
      setDriverEmails(emails || []);
    };
    fetchDrivers();
  }, [sponsorOrgID]);
  const [selectedReport, setSelectedReport] = useState("Driver Point Changes");
  const [viewMode, setViewMode] = useState("table");
  const [reportData, setReportData] = useState<any[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sponsorId, setSponsorId] = useState("");
  const [driverEmail, setDriverEmail] = useState("");
  const generateReport = async () => {
    const finalSponsorId = String(sponsorOrgID || sponsorId || "");
    let data: any[] = [];
    try {
      switch (selectedReport) {
        case "Driver Point Changes": {
          let fetched = await getPointChanges(startDate, endDate, driverEmail);
          if (Array.isArray(fetched) && Array.isArray(fetched[0])) {
            fetched = fetched[0];
          }
          if (isSponsor && driverEmails.length > 0) {
            fetched = fetched.filter((item) =>
              driverEmails.includes(item.PointChangeDriver)
            );
          }
          data = fetched;
          break;
        }
        case "Driver Applications": {
          let fetched = await getDriverApplications(startDate, endDate, finalSponsorId, driverEmail);
          if (Array.isArray(fetched) && Array.isArray(fetched[0])) {
            fetched = fetched[0];
          }
          if (isSponsor && driverEmails.length > 0) {
            fetched = fetched.filter((item) =>
              driverEmails.includes(item.ApplicationDriver)
            );
          }
          data = fetched;
          break;
        }
        case "Purchases": {
          let fetched = await getPurchaseData(startDate, endDate, finalSponsorId, driverEmail);
          if (Array.isArray(fetched) && Array.isArray(fetched[0])) {
            fetched = fetched[0];
          }
          if (isSponsor && driverEmails.length > 0) {
            fetched = fetched.filter((item) =>
              driverEmails.includes(item.PurchaseDriver)
            );
          }
          data = fetched;
          break;
        }
        case "Invoices": {
          let fetched = await getInvoices(startDate, endDate, finalSponsorId);
          if (Array.isArray(fetched) && Array.isArray(fetched[0])) {
            fetched = fetched[0];
          }
          if (isSponsor && driverEmails.length > 0) {
            fetched = fetched.filter((item) =>
              driverEmails.includes(item.PurchaseDriver)
            );
          }
          data = fetched;
          break;
        }
        case "Password Change Logs": {
          let fetched = await getPasswordChanges(startDate, endDate, driverEmail);
          if (isSponsor && driverEmails.length > 0) {
            fetched = fetched.filter((item) =>
              driverEmails.includes(item.user)
            );
          }
          data = fetched;
          break;
        }
        case "Login Attempts Logs": {
          let fetched = await getLoginAttempts(startDate, endDate, driverEmail);
          if (isSponsor && driverEmails.length > 0) {
            fetched = fetched.filter((item) =>
              driverEmails.includes(item.user)
            );
          }
          data = fetched;
          break;
        }
        default:
          data = [];
          break;
      }
    } catch (err) {
      data = [];
    }
    setReportData(data);
  };
  const downloadPDF = async () => {
    const element = document.getElementById("report-content");
    if (!element) return;
    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 10, 10, 180, 0);
      pdf.save("report.pdf");
    } catch (error) {}
  };
  const downloadCSV = () => {
    if (!reportData || !Array.isArray(reportData) || reportData.length === 0) return;
    const headers = Object.keys(reportData[0]).join(",");
    const rows = reportData.map((item) =>
      Object.values(item)
        .map((value) => `"${value}"`)
        .join(",")
    );
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "report.csv";
    link.click();
    URL.revokeObjectURL(url);
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
    } else if (selectedReport === "Purchases") {
      return (
        <TableRow>
          <TableCell>PurchaseDriver</TableCell>
          <TableCell>OrganizationName</TableCell>
          <TableCell>PurchaseDate</TableCell>
          <TableCell>PurchaseStatus</TableCell>
        </TableRow>
      );
    } else if (selectedReport === "Invoices") {
      return (
        <TableRow>
          <TableCell>PurchaseDriver</TableCell>
          <TableCell>OrganizationName</TableCell>
          <TableCell>PurchaseDate</TableCell>
          <TableCell>PurchaseStatus</TableCell>
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
    if (!Array.isArray(reportData)) return null;
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
    } else if (selectedReport === "Purchases") {
      return reportData.map((item, index) => (
        <TableRow key={index}>
          <TableCell>{item.PurchaseDriver}</TableCell>
          <TableCell>{item.OrganizationName}</TableCell>
          <TableCell>{item.PurchaseDate}</TableCell>
          <TableCell>{item.PurchaseStatus}</TableCell>
        </TableRow>
      ));
    } else if (selectedReport === "Invoices") {
      return reportData.map((item, index) => (
        <TableRow key={index}>
          <TableCell>{item.PurchaseDriver}</TableCell>
          <TableCell>{item.OrganizationName}</TableCell>
          <TableCell>{item.PurchaseDate}</TableCell>
          <TableCell>{item.PurchaseStatus}</TableCell>
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
    const hideSponsorIdField =
      (selectedReport === "Driver Applications" || selectedReport === "Purchases" || selectedReport === "Invoices") && isSponsor;
    if (
      selectedReport === "Driver Point Changes" ||
      selectedReport === "Driver Applications" ||
      selectedReport === "Password Change Logs" ||
      selectedReport === "Purchases" ||
      selectedReport === "Login Attempts Logs" ||
      selectedReport === "Invoices"
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
          {(selectedReport === "Driver Applications" || selectedReport === "Purchases" || selectedReport === "Invoices") && !hideSponsorIdField && (
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
            <MenuItem value="Invoices">Invoices</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={generateReport}>
          Generate
        </Button>
      </div>
      {renderFilters()}
      <div className="flex items-center gap-4 mb-4">
        <Button variant={viewMode === "table" ? "contained" : "outlined"} onClick={() => setViewMode("table")}>
          Table
        </Button>
        <Button variant={viewMode === "chart" ? "contained" : "outlined"} onClick={() => setViewMode("chart")}>
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
