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
*/

const sampleData = [
  { driver: "John Doe", pointChange: 5, date: "2025-03-10" },
  { driver: "Jane Smith", pointChange: -3, date: "2025-03-12" },
  { driver: "Alex Johnson", pointChange: 2, date: "2025-03-14" },
];

const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState("Driver Point Changes");
  const [viewMode, setViewMode] = useState("table");
  const [reportData, setReportData] = useState(sampleData);

  const generateReport = () => {
    console.log(`Generating report: ${selectedReport}`);
    let data = []
    if (selectedReport === "All Driver Point Changes") {
        // Fetch or set sample data for all driver point changes
        data = sampleData; // Replace with an API call if needed
      } else if (selectedReport === "Specific Driver Point Changes") {
        // Fetch or set sample data for specific driver point changes
        data = [
          { driver: "John Doe", pointChange: 5, date: "2025-03-10" }, // Example data
        ];
      } else if (selectedReport === "Sales By Driver") {
        // Fetch or set sample data for sales by driver
        data = [
          { driver: "Jane Smith", sales: 1200, date: "2025-03-12" }, // Example data
        ];
      } else if (selectedReport === "Sales By Sponsor") {
        // Fetch or set sample data for sales by sponsor
        data = [
          { sponsor: "Company A", sales: 5000, date: "2025-03-14" }, // Example data
        ];
      } else (selectedReport === "Invoice") {
        // Fetch or set sample data for invoices
        data = [
          { invoiceNumber: "INV123", amount: 1000, date: "2025-03-16" }, // Example data
        ];
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
                    {selectedReport === "Invoice" ? (
                      <>
                        <TableCell>Invoice Number</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Date</TableCell>
                      </>
                    ) : selectedReport === "Sales By Sponsor" ? (
                      <>
                        <TableCell>Sponsor</TableCell>
                        <TableCell>Sales</TableCell>
                        <TableCell>Date</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>Driver</TableCell>
                        <TableCell>{selectedReport.includes("Sales") ? "Sales" : "Point Change"}</TableCell>
                        <TableCell>Date</TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.map((item, index) => (
                    <TableRow key={index}>
                      {selectedReport === "Invoice" ? (
                        <>
                          <TableCell>{item.invoiceNumber}</TableCell>
                          <TableCell>{item.amount}</TableCell>
                          <TableCell>{item.date}</TableCell>
                        </>
                      ) : selectedReport === "Sales By Sponsor" ? (
                        <>
                          <TableCell>{item.sponsor}</TableCell>
                          <TableCell>{item.sales}</TableCell>
                          <TableCell>{item.date}</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{item.driver}</TableCell>
                          <TableCell>{selectedReport.includes("Sales") ? item.sales : item.pointChange}</TableCell>
                          <TableCell>{item.date}</TableCell>
                        </>
                      )}
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
