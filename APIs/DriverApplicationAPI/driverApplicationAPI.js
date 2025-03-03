import express from "express";
import serverlessExpress from "@vendia/serverless-express";
import mysql from "mysql2";
import cors from "cors";

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
/**
 * Simple status endpoint
 */
app.get("/status", (req, res) => {
  const status = { Status: "Running" };
  res.json(status);
});

/**
 * Create a new driver-sponsor application
 * Expects JSON body:
 * {
 *   "ApplicationDriver": "string",
 *   "ApplicationOrganization": 123,
 *   "ApplicationSponsorUser": "string",
 *   "ApplicationStatus": "string"
 * }
 */
app.post("/driversponsorapplication", (req, res) => {
  const {
    ApplicationDriver,
    ApplicationOrganization,
    ApplicationSponsorUser,
    ApplicationStatus,
  } = req.body;

  if (
    !ApplicationDriver ||
    !ApplicationOrganization ||
    !ApplicationSponsorUser ||
    !ApplicationStatus
  ) {
    return res.status(400).json({
      error:
        "ApplicationDriver, ApplicationOrganization, ApplicationSponsorUser, and ApplicationStatus are required",
    });
  }

  var organizationPresent = true;
  var sponsorUserPresent = true;
  var driverPresent = true;

  // check if the organization exists
  const selectOrganizationQuery = `
    SELECT *
    FROM DRS.sponsororganizations
    WHERE OrganizationID = ?
  `;
  db.query(selectOrganizationQuery, [ApplicationOrganization], (err, results) => {
    if (err) {
      console.error("Database select error on organizations:", err);
      return res.status(500).json({ error: "Database error on organizations" });
    }
    if (results.length === 0) {
      organizationPresent = false;
    }
  });

  // check if the sponsor user exists
  const selectSponsorUserQuery = `
    SELECT *
    FROM DRS.sponsorusers
    WHERE UserEmail = ?
  `; 
  db.query(selectSponsorUserQuery, [ApplicationSponsorUser], (err, results) => {
    if (err) {
      console.error("Database select error on sponsorusers:", err);
      return res.status(500).json({ error: "Database error on sponsor users" });
    }
    if (results.length === 0) {
      sponsorUserPresent = false;
    }
  });

  // check if the driver exists
  const selectDriverQuery = `
    SELECT *
    FROM DRS.drivers
    WHERE DriverEmail = ?
  `;
  db.query(selectDriverQuery, [ApplicationDriver], (err, results) => {
    if (err) {
      console.error("Database select error on drivers:", err);
      return res.status(500).json({ error: "Database error on drivers" });
    }
    if (results.length === 0) {
      driverPresent = false;
    }
  });

  if (!organizationPresent || !sponsorUserPresent || !driverPresent) {
    return res.status(400).json({
      error: "Organization, sponsor user, or driver not found",
      organizationPresent: organizationPresent,
      sponsorUserPresent: sponsorUserPresent,
      driverPresent: driverPresent,
    });
  }

  const insertQuery = `
  INSERT INTO DRS.driversponsorapplications 
  (ApplicationDriver, ApplicationOrganization, ApplicationSponsorUser, ApplicationStatus, ApplicationSubmittedDate)
  VALUES (?, ?, ?, ?, NOW())`;

  db.query(
    insertQuery,
    [
      ApplicationDriver,
      ApplicationOrganization,
      ApplicationSponsorUser,
      ApplicationStatus,
    ],
    (err, results) => {
      if (err) {
        console.error("Database insert error:", err);
        return res.status(500).json({ error: "Database insert error" });
      }

      // results.insertId should contain the new ApplicationID (if auto-incremented)
      const newId = results.insertId;
      res.status(201).json({
        message: "Application created",
        application: {
          ApplicationDriver,
          ApplicationOrganization,
          ApplicationSponsorUser,
          ApplicationStatus
        },
      });
    }
  );
});

/**
 * Get a single driver-sponsor application by ApplicationID
 * Expects JSON body or query param:
 * {
 *   "ApplicationID": 123
 * }
 */
app.get("/driversponsorapplication", (req, res) => {
  // You can use req.query or req.body. Here we’ll assume body for consistency with your admins example:
  const { ApplicationID } = req.query;

  if (!ApplicationID) {
    return res.status(400).json({ error: "ApplicationID required" });
  }

  const selectQuery = `
    SELECT * 
    FROM driversponsorapplications
    WHERE ApplicationID = ?
  `;

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
  }
  else if (ApplicationSponsorUser && !ApplicationDriver) {
    selectQuery += " WHERE ApplicationSponsorUser = ?";
    queryParams.push(ApplicationSponsorUser);
  }
  else if (ApplicationDriver && ApplicationSponsorUser) {
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
 * Expects JSON body with ApplicationID plus any fields to update:
 * {
 *   "ApplicationID": 123,
 *   "ApplicationDriver": "New Driver Name",
 *   "ApplicationOrganization": 999,
 *   "ApplicationSponsorUser": "someemail@domain.com",
 *   "ApplicationStatus": "APPROVED"
 * }
 */
app.put("/driversponsorapplication", (req, res) => {
  const {
    ApplicationID,
    ApplicationDriver,
    ApplicationOrganization,
    ApplicationSponsorUser,
    ApplicationStatus,
  } = req.body;

  if (!ApplicationID) {
    return res.status(400).json({ error: "ApplicationID required" });
  }

  // Check if the record exists
  const selectQuery = `
    SELECT * 
    FROM driversponsorapplications
    WHERE ApplicationID = ?
  `;

  db.query(selectQuery, [ApplicationID], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (ApplicationDriver) {
      updates.push("ApplicationDriver = ?");
      values.push(ApplicationDriver);
    }
    if (ApplicationOrganization != null) {
      updates.push("ApplicationOrganization = ?");
      values.push(ApplicationOrganization);
    }
    if (ApplicationSponsorUser) {
      updates.push("ApplicationSponsorUser = ?");
      values.push(ApplicationSponsorUser);
    }
    if (ApplicationStatus) {
      updates.push("ApplicationStatus = ?");
      values.push(ApplicationStatus);
    }

    // If nothing to update, just return
    if (updates.length === 0) {
      return res.json({ message: "No changes provided" });
    }

    // Final update statement
    const updateQuery = `
      UPDATE driversponsorapplications
      SET ${updates.join(", ")}
      WHERE ApplicationID = ?
    `;
    values.push(ApplicationID);

    db.query(updateQuery, values, (updateErr) => {
      if (updateErr) {
        console.error("Database update error:", updateErr);
        return res.status(500).json({ error: "Database update error" });
      }

      // Return the updated record
      db.query(selectQuery, [ApplicationID], (selErr, selResults) => {
        if (selErr) {
          console.error("Database select error after update:", selErr);
          return res
            .status(500)
            .json({ error: "Database select error after update" });
        }
        return res.json({
          message: "Application updated",
          application: selResults[0],
        });
      });
    });
  });
});

/**
 * Delete a driver-sponsor application by ApplicationID
 * Expects JSON body:
 * {
 *   "ApplicationID": 123
 * }
 */
app.delete("/driversponsorapplication", (req, res) => {
  const { ApplicationID } = req.body; // ✅ Read from request body instead of query params

  if (!ApplicationID) {
    return res.status(400).json({ error: "ApplicationID required" });
  }

  // Check if the record exists
  const selectQuery = `
    SELECT * 
    FROM driversponsorapplications
    WHERE ApplicationID = ?
  `;

  db.query(selectQuery, [ApplicationID], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    const applicationToDelete = results[0];

    // Perform the delete
    const deleteQuery = `
      DELETE FROM driversponsorapplications
      WHERE ApplicationID = ?
    `;
    db.query(deleteQuery, [ApplicationID], (deleteErr) => {
      if (deleteErr) {
        console.error("Database delete error:", deleteErr);
        return res.status(500).json({ error: "Database delete error" });
      }

      return res.json({
        message: "Application deleted successfully",
        application: applicationToDelete,
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
 * Export the handler for AWS Lambda (Serverless Express)
 */
export const handler = serverlessExpress({ app });

