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

console.log("DEBUG: HELLO from the Reports component file!");

/** ===================== CONSTANTS ===================== */
const REPORTS_URL = "https://8y9n1ik5pc.execute-api.us-east-1.amazonaws.com/dev1";
const SPONSOR_BASE_URL = "https://v4ihiexduh.execute-api.us-east-1.amazonaws.com/dev1";

/** 
 * New endpoint to fetch sponsor drivers 
 * (update if the actual base URL differs) 
 */
const SPONSOR_DRIVERS_URL = "https://vnduk955ek.execute-api.us-east-1.amazonaws.com/dev1";

/** ===================== API FUNCTIONS ===================== */
async function getPointChanges(
  startDate?: string,
  endDate?: string,
  driverEmail?: string
): Promise<any[]> {
  const url = new URL(`${REPORTS_URL}/pointChanges`);
  if (startDate && startDate.trim() !== "") url.searchParams.append("StartDate", startDate);
  if (endDate && endDate.trim() !== "") url.searchParams.append("EndDate", endDate);
  if (driverEmail && driverEmail.trim() !== "") url.searchParams.append("DriverEmail", driverEmail);

  console.log("DEBUG: getPointChanges() -> fetching:", url.toString());

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      console.error("ERROR in getPointChanges:", errorText);
      return [];
    }
    const data = await response.json();
    console.log("DEBUG: Raw data from getPointChanges:", data);
    return data;
  } catch (error) {
    console.error("ERROR in getPointChanges:", error);
    return [];
  }
}

async function getDriverApplications(
  startDate?: string,
  endDate?: string,
  sponsorId?: string,
  driverEmail?: string
): Promise<any[]> {
  const url = new URL(`${REPORTS_URL}/driverApplications`);
  if (startDate && startDate.trim() !== "") url.searchParams.append("StartDate", startDate);
  if (endDate && endDate.trim() !== "") url.searchParams.append("EndDate", endDate);
  if (sponsorId && sponsorId.trim() !== "") url.searchParams.append("SponsorID", sponsorId);
  if (driverEmail && driverEmail.trim() !== "") url.searchParams.append("DriverEmail", driverEmail);

  console.log("DEBUG: getDriverApplications() -> fetching:", url.toString());

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      console.error("ERROR in getDriverApplications:", errorText);
      return [];
    }
    const data = await response.json();
    console.log("DEBUG: Raw data from getDriverApplications:", data);
    return data;
  } catch (error) {
    console.error("ERROR in getDriverApplications:", error);
    return [];
  }
}

async function getPasswordChanges(
  startDate?: string,
  endDate?: string,
  userEmail?: string
): Promise<any[]> {
  const url = new URL(`${REPORTS_URL}/passwordChanges`);
  if (startDate && startDate.trim() !== "") url.searchParams.append("StartDate", startDate);
  if (endDate && endDate.trim() !== "") url.searchParams.append("EndDate", endDate);
  if (userEmail && userEmail.trim() !== "") url.searchParams.append("UserEmail", userEmail);

  console.log("DEBUG: getPasswordChanges() -> fetching:", url.toString());

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      console.error("ERROR in getPasswordChanges:", errorText);
      return [];
    }
    const data = await response.json();
    console.log("DEBUG: Raw data from getPasswordChanges:", data);
    return data;
  } catch (error) {
    console.error("ERROR in getPasswordChanges:", error);
    return [];
  }
}

async function getLoginAttempts(
  startDate?: string,
  endDate?: string,
  userEmail?: string
): Promise<any[]> {
  const url = new URL(`${REPORTS_URL}/loginAttempts`);
  if (startDate && startDate.trim() !== "") url.searchParams.append("StartDate", startDate);
  if (endDate && endDate.trim() !== "") url.searchParams.append("EndDate", endDate);
  if (userEmail && userEmail.trim() !== "") url.searchParams.append("UserEmail", userEmail);

  console.log("DEBUG: getLoginAttempts() -> fetching:", url.toString());

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      console.error("ERROR in getLoginAttempts:", errorText);
      return [];
    }
    const data = await response.json();
    console.log("DEBUG: Raw data from getLoginAttempts:", data);
    return data;
  } catch (error) {
    console.error("ERROR in getLoginAttempts:", error);
    return [];
  }
}

async function getPurchaseData(
  startDate?: string,
  endDate?: string,
  sponsorId?: string,
  driverEmail?: string
): Promise<any[]> {
  const url = new URL(`${REPORTS_URL}/purchases`);
  if (startDate && startDate.trim() !== "") url.searchParams.append("StartDate", startDate);
  if (endDate && endDate.trim() !== "") url.searchParams.append("EndDate", endDate);
  if (sponsorId && sponsorId.trim() !== "") url.searchParams.append("SponsorID", sponsorId);
  if (driverEmail && driverEmail.trim() !== "") url.searchParams.append("DriverEmail", driverEmail);

  console.log("DEBUG: getPurchaseData() -> fetching:", url.toString());

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      console.error("ERROR in getPurchaseData:", errorText);
      return [];
    }
    const data = await response.json();
    console.log("DEBUG: Raw data from getPurchaseData:", data);
    return data;
  } catch (error) {
    console.error("ERROR in getPurchaseData:", error);
    return [];
  }
}

/**
 * NEW function to get the sponsor's drivers. 
 * Replace field names with whatever your API returns.
 */
async function getSponsorDrivers(sponsorOrgID: string | number): Promise<string[]> {
  // Example: https://vnduk955ek.execute-api.us-east-1.amazonaws.com/dev1/driverssponsors?DriversSponsorID=3
  const url = new URL(`${SPONSOR_DRIVERS_URL}/driverssponsors`);
  url.searchParams.append("DriversSponsorID", String(sponsorOrgID));

  console.log("DEBUG: getSponsorDrivers() -> fetching:", url.toString());

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      console.error("ERROR in getSponsorDrivers:", errorText);
      return [];
    }

    const data = await response.json();

    console.log("DEBUG: Raw data from getSponsorDrivers:", data);

    // Each object looks like:
    // {
    //   "DriversEmail": "someemail@example.com",
    //   "DriversSponsorID": 3,
    //   "DriversPoints": "20.00"
    // }
    // We only want the email.
    const emails = data.map((item: any) => item.DriversEmail);
    console.log("DEBUG: Extracted driverEmails:", emails);
    return emails;
  } catch (error) {
    console.error("ERROR fetching sponsor drivers:", error);
    return [];
  }
}

/** ===================== COMPONENT ===================== */
const Reports: React.FC = () => {
  console.log("DEBUG: <Reports /> component mounting...");

  // ------------------ 1. Auth + Sponsor detection ------------------
  const auth = useAuth();
  console.log("DEBUG: Auth object:", auth);

  // We'll store whether user is sponsor based on Cognito groups
  const [isSponsor, setIsSponsor] = useState<boolean>(false);

  useEffect(() => {
    // Grab the user's groups from "cognito:groups"
    const maybeGroups = auth.user?.profile?.["cognito:groups"];
    const groups = Array.isArray(maybeGroups) ? maybeGroups : [];
    const sponsorCheck = groups.includes("Sponsor");
    setIsSponsor(sponsorCheck);

    console.log("DEBUG: user groups is:", groups, "-> isSponsor?", sponsorCheck);
  }, [auth.user]);

  // ------------------ 2. Store sponsorOrgID and fetch driver emails ------------------
  const [sponsorOrgID, setSponsorOrgID] = useState<string | null>(null);

  // We'll store the list of driver emails for that sponsor
  const [driverEmails, setDriverEmails] = useState<string[]>([]);

  // A) Get sponsorOrgID
  useEffect(() => {
    if (!isSponsor) {
      console.log("DEBUG: Not a sponsor -> skipping sponsorOrgID fetch.");
      return;
    }
    if (!auth.user?.profile?.email) {
      console.log("DEBUG: No email found -> skipping sponsorOrgID fetch.");
      return;
    }

    // If sponsor, fetch the org
    console.log("DEBUG: Attempting to fetch sponsor org for email:", auth.user.profile.email);

    const fetchSponsorOrg = async () => {
      try {
        const sponsorEmail = encodeURIComponent(auth.user?.profile?.email || "");
        const url = `${SPONSOR_BASE_URL}/sponsor?UserEmail=${sponsorEmail}`;
        console.log("DEBUG: fetchSponsorOrg() -> fetching:", url);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch sponsor: ${response.status}`);
        }
        const data = await response.json();

        console.log("DEBUG: raw sponsor data returned:", data);

        let sponsor;
        if (Array.isArray(data)) {
          sponsor = data.find((s: any) => s.UserEmail === auth.user?.profile?.email);
        } else {
          sponsor = data;
        }

        if (sponsor && sponsor.UserOrganization) {
          console.log("DEBUG: sponsorOrgID found:", sponsor.UserOrganization);
          setSponsorOrgID(sponsor.UserOrganization);
        } else {
          console.log("DEBUG: sponsor object didn't have a UserOrganization property");
        }
      } catch (error) {
        console.error("ERROR fetching sponsor organization:", error);
      }
    };

    fetchSponsorOrg();
  }, [isSponsor, auth.user]);

  // B) Once we have sponsorOrgID, fetch all drivers for that sponsor
  useEffect(() => {
    if (!sponsorOrgID) {
      console.log("DEBUG: sponsorOrgID is null, skipping driver fetch");
      return;
    }
    console.log("DEBUG: sponsorOrgID has changed. Attempting to fetch sponsor drivers...");

    const fetchDrivers = async () => {
      const emails = await getSponsorDrivers(sponsorOrgID);
      setDriverEmails(emails || []);
    };

    fetchDrivers();
  }, [sponsorOrgID]);

  // ------------------ 3. Report state & fields ------------------
  const [selectedReport, setSelectedReport] = useState("Driver Point Changes");
  const [viewMode, setViewMode] = useState("table");
  const [reportData, setReportData] = useState<any[]>([]);

  // Additional filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sponsorId, setSponsorId] = useState("");
  const [driverEmail, setDriverEmail] = useState("");

  // ------------------ 4. Generate Report ------------------
  const generateReport = async () => {
    console.log("DEBUG: generateReport() -> selectedReport:", selectedReport);
    console.log("DEBUG: startDate:", startDate, "endDate:", endDate);
    console.log("DEBUG: userProvided sponsorId:", sponsorId, "driverEmail:", driverEmail);
    console.log("DEBUG: isSponsor:", isSponsor, "sponsorOrgID:", sponsorOrgID);
    console.log("DEBUG: driverEmails array:", driverEmails);

    // If the user is a sponsor, override the sponsorId with sponsorOrgID
    let finalSponsorId = sponsorId;
    if (isSponsor && sponsorOrgID) {
      finalSponsorId = sponsorOrgID;
      console.log("DEBUG: Overriding sponsorId with sponsorOrgID ->", finalSponsorId);
    }

    let data: any[] = [];

    try {
      switch (selectedReport) {
        case "Driver Point Changes": {
          let fetched = await getPointChanges(startDate, endDate, driverEmail);

          // Some APIs return [[...]], flatten if needed
          if (Array.isArray(fetched) && Array.isArray(fetched[0])) {
            fetched = fetched[0];
          }

          console.log("DEBUG: Full pointChanges data before filter:", fetched);

          // If the user is sponsor, filter by driverEmails
          if (isSponsor && driverEmails.length > 0) {
            fetched = fetched.filter((item) => {
              // item.PointChangeDriver should match one of driverEmails
              return driverEmails.includes(item.PointChangeDriver);
            });
            console.log("DEBUG: Data AFTER driverEmails filter:", fetched);
          }

          data = fetched;
          break;
        }

        case "Driver Applications": {
          let fetched = await getDriverApplications(startDate, endDate, finalSponsorId, driverEmail);
          if (Array.isArray(fetched) && Array.isArray(fetched[0])) {
            fetched = fetched[0];
          }
          console.log("DEBUG: Full driverApplications data before filter:", fetched);

          if (isSponsor && driverEmails.length > 0) {
            fetched = fetched.filter((item) => driverEmails.includes(item.ApplicationDriver));
            console.log("DEBUG: Data AFTER driverEmails filter:", fetched);
          }

          data = fetched;
          break;
        }

        case "Password Change Logs": {
          // Probably these logs don't have a concept of "driver" or sponsor,
          // but if you still want to filter by driverEmails, do so.
          data = await getPasswordChanges(startDate, endDate, driverEmail);

          // If you want to filter out non-sponsor's drivers:
          // data = data.filter((item) => driverEmails.includes(item.user));
          break;
        }

        case "Login Attempts Logs": {
          data = await getLoginAttempts(startDate, endDate, driverEmail);
          // Similarly, if you only want sponsor drivers:
          // data = data.filter((item) => driverEmails.includes(item.user));
          break;
        }

        case "Purchases": {
          let fetched = await getPurchaseData(startDate, endDate, finalSponsorId, driverEmail);
          if (Array.isArray(fetched) && Array.isArray(fetched[0])) {
            fetched = fetched[0];
          }

          console.log("DEBUG: Full purchases data before filter:", fetched);

          if (isSponsor && driverEmails.length > 0) {
            fetched = fetched.filter((item) => driverEmails.includes(item.PurchaseDriver));
            console.log("DEBUG: Data AFTER driverEmails filter:", fetched);
          }

          data = fetched;
          break;
        }

        default:
          console.log("DEBUG: Unrecognized report, returning empty data");
          data = [];
          break;
      }
    } catch (err) {
      console.error("ERROR in generateReport switch/catch:", err);
      data = [];
    }

    console.log("DEBUG: final data from generateReport:", data);
    setReportData(data);
  };

  // ------------------ 5. Download PDF ------------------
  const downloadPDF = async () => {
    console.log("DEBUG: Attempting to download PDF");
    const element = document.getElementById("report-content");
    if (!element) {
      console.error("ERROR: #report-content element not found");
      return;
    }
    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 10, 10, 180, 0);
      pdf.save("report.pdf");
    } catch (error) {
      console.error("ERROR in downloadPDF:", error);
    }
  };

  // ------------------ 6. Download CSV ------------------
  const downloadCSV = () => {
    console.log("DEBUG: Attempting to download CSV for data:", reportData);
    if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
      console.error("ERROR: No data available for CSV download.");
      return;
    }

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

  // ------------------ 7. Render Table Headers ------------------
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
      // fallback (e.g., "Invoice" or something else)
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

  // ------------------ 8. Render Table Rows ------------------
  const renderTableRows = () => {
    if (!Array.isArray(reportData)) {
      console.log("DEBUG: reportData is not an array, no rows to render");
      return null;
    }

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

  // ------------------ 9. Render Additional Filters (UI) ------------------
  const renderFilters = () => {
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

  // ------------------ RENDERING THE COMPONENT ------------------
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
              {/* Simple example chart for "Driver Point Changes" */}
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
