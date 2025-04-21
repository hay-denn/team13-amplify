import express from "express";
import serverlessExpress from "@vendia/serverless-express";
import mysql from "mysql2";
import cors from "cors";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_URL,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: "DRS",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Initialize AWS SES Client
const sesClient = new SESClient({ region: "us-east-1" });

// Function to send email via AWS SES
async function sendEmail(toEmail, subject, body) {
  const emailParams = {
    Source: "cognito@cpsc4911.com", // Must be a verified email in SES
    Destination: { ToAddresses: [toEmail] },
    Message: {
      Subject: { Data: subject },
      Body: { Text: { Data: body } },
    },
  };
  try {
    const command = new SendEmailCommand(emailParams);
    const result = await sesClient.send(command);
    console.log(`✅ Email sent to ${toEmail}`, result);
  } catch (error) {
    console.error(`❌ Failed to send email to ${toEmail}:`, error);
  }
}

/**
 * Simple status endpoint
 */
app.get("/status", (req, res) => {
  const status = { Status: "Running" };
  res.json(status);
});

/**
 * Create a new driver-sponsor application
 */
app.post("/driversponsorapplication", (req, res) => {
  const { ApplicationDriver, ApplicationOrganization, ApplicationStatus,
    ApplicationReason} = req.body;

  if (!ApplicationDriver || !ApplicationOrganization) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let insertQuery = `
  INSERT INTO DRS.driversponsorapplications 
  (ApplicationDriver, ApplicationOrganization, ApplicationDateSubmitted
  `;
  let insertQueryEnd = ") VALUES (?, ?, NOW()";

  const values = [ApplicationDriver, ApplicationOrganization];


  if (ApplicationStatus) {
    insertQuery += ", ApplicationStatus";
    insertQueryEnd += ", ?";
    values.push(ApplicationStatus);
  }
  if (ApplicationReason) {
    insertQuery += ", ApplicationReason";
    insertQueryEnd += ", ?";
    values.push(ApplicationReason);
  }

  insertQuery += insertQueryEnd + ")";

  db.query(insertQuery, values, (err, results) => {
    if (err) {
      console.error("Database insert error:", err);
      return res.status(500).json({ error: "Database insert error", err });
    }

    res.status(201).json({
      message: "Application created",
      application: { ApplicationDriver, ApplicationOrganization },
    });
  });
});

/**
 * Get a single driver-sponsor application
 */
app.get("/driversponsorapplication", (req, res) => {
  const { ApplicationID } = req.query;
  if (!ApplicationID) {
    return res.status(400).json({ error: "ApplicationID required" });
  }

  const selectQuery = "SELECT * FROM driversponsorapplications WHERE ApplicationID = ?";
  db.query(selectQuery, [ApplicationID], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.json(results[0]);
  });
});

/**
 * Get all driver-sponsor applications
 */
app.get("/driversponsorapplications", (req, res) => {
  const { ApplicationDriver, ApplicationSponsorUser } = req.query;

  let selectQuery = "SELECT * FROM driversponsorapplications";
  let queryParams = [];

  if (ApplicationDriver && !ApplicationSponsorUser) {
    selectQuery += " WHERE ApplicationDriver = ?";
    queryParams.push(ApplicationDriver);
  } else if (ApplicationSponsorUser && !ApplicationDriver) {
    selectQuery += " WHERE ApplicationSponsorUser = ?";
    queryParams.push(ApplicationSponsorUser);
  } else if (ApplicationDriver && ApplicationSponsorUser) {
    selectQuery += " WHERE ApplicationDriver = ? AND ApplicationSponsorUser = ?";
    queryParams.push(ApplicationDriver, ApplicationSponsorUser);
  }

  db.query(selectQuery, queryParams, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

/**
 * Update an existing driver-sponsor application
 */
app.put("/driversponsorapplication", (req, res) => {
  const { ApplicationID, ApplicationDriver, ApplicationOrganization, 
    ApplicationSponsorUser, ApplicationStatus, ApplicationDecisionReason,
    ApplicationReason } = req.body;

  if (!ApplicationID) {
    return res.status(400).json({ error: "ApplicationID required" });
  }

  // Check if the record exists
  const selectQuery = "SELECT * FROM driversponsorapplications WHERE ApplicationID = ?";

  db.query(selectQuery, [ApplicationID], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    const application = results[0];

    // Build update query dynamically
    const updates = [];
    const values = [];
    if (ApplicationDriver) updates.push("ApplicationDriver = ?"), values.push(ApplicationDriver);
    if (ApplicationOrganization != null) updates.push("ApplicationOrganization = ?"), values.push(ApplicationOrganization);
    if (ApplicationSponsorUser) updates.push("ApplicationSponsorUser = ?"), values.push(ApplicationSponsorUser);
    if (ApplicationStatus) updates.push("ApplicationStatus = ?"), values.push(ApplicationStatus);
    if (ApplicationReason) updates.push("ApplicationReason = ?"), values.push(ApplicationReason);
    if (ApplicationDecisionReason) updates.push("ApplicationDecisionReason = ?"), values.push(ApplicationDecisionReason);

    if (updates.length === 0) {
      return res.json({ message: "No changes provided" });
    }

    const updateQuery = `UPDATE driversponsorapplications SET ${updates.join(", ")} WHERE ApplicationID = ?`;
    values.push(ApplicationID);

    db.query(updateQuery, values, async (updateErr) => {
      if (updateErr) {
        console.error("Database update error:", updateErr);
        return res.status(500).json({ error: "Database update error"});
      }

      // Retrieve the updated record AFTER the update
      db.query(selectQuery, [ApplicationID], async (selErr, selResults) => {
        if (selErr) {
          console.error("Database select error after update:", selErr);
          return res.status(500).json({ error: "Database select error after update" });
        }

        const updatedApplication = selResults[0];

        console.log("Updated Application:", updatedApplication); // Debugging log

        // Ensure ApplicationStatus is updated correctly before sending an email
        if (!updatedApplication.ApplicationStatus) {
          console.warn("ApplicationStatus is missing or null, skipping email.");
          return res.json({ message: "Application updated but no email was sent.", application: updatedApplication });
        }

        // Send email if application is accepted or rejected
        if (["approved", "rejected"].includes(updatedApplication.ApplicationStatus.toLowerCase())) {
          const driverEmail = updatedApplication.ApplicationDriver;
          const subject = updatedApplication.ApplicationStatus.toLowerCase() === "approved"
            ? "Your Sponsor Application Has Been Approved 🎉"
            : "Your Sponsor Application Was Rejected ❌";
          const body = updatedApplication.ApplicationStatus.toLowerCase() === "approved"
            ? "Congratulations! Your application has been approved. You are now officially sponsored."
            : "Unfortunately, your application has been rejected. Please consider applying to another sponsor.";

          console.log(`📧 Sending email to: ${driverEmail}, Subject: ${subject}`); // Log before sending email

          try {
            await sendEmail(driverEmail, subject, body);
            console.log(`✅ Email successfully sent to ${driverEmail}`);
          } catch (error) {
            console.error(`❌ Error sending email to ${driverEmail}:`, error);
          }
        } else {
          console.log("Application status is neither approved nor rejected. No email sent.");
        }

        return res.json({
          message: "Application updated. Email notification sent if applicable.",
          application: updatedApplication,
        });
      });
    });
  });
});


/**
 * Get count of driver-sponsor applications
 */
app.get("/driversponsorapplications_count", (req, res) => {
  const countQuery = `
    SELECT COUNT(*) AS count
    FROM driversponsorapplications
  `;
  db.query(countQuery, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    return res.json({ count: results[0].count });
  });
});

/**
 * Delete a driver-sponsor application
 */
app.delete("/driversponsorapplication", (req, res) => {
  const { ApplicationID } = req.query;

  if (!ApplicationID) {
    return res.status(400).json({ error: "ApplicationID required" });
  }

  const deleteQuery = "DELETE FROM driversponsorapplications WHERE ApplicationID = ?";
  db.query(deleteQuery, [ApplicationID], (deleteErr) => {
    if (deleteErr) {
      console.error("Database delete error:", deleteErr);
      return res.status(500).json({ error: "Database delete error" });
    }
    res.json({ message: "Application deleted successfully" });
  });
});

/**
 * Export the handler for AWS Lambda
 */
export const handler = serverlessExpress({ app });
