import express from "express";
import serverlessExpress from "@vendia/serverless-express";
import mysql from "mysql2";
import cors from "cors";

const app = express();  
app.use(cors({ origin: "*" }));
app.use(express.json());

app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.status(200).end();
});

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: "DRS",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/*
 * get point changes report
 */
app.get("/pointChanges", (request, response) => {
  const { StartDate, EndDate, DriverEmail } = request.query;

  const startDateParam = StartDate || null;
  const endDateParam = EndDate || null;
  const driverEmailParam = DriverEmail || null;

  db.query(
    "CALL AllDriversPointChanges(?, ?, ?)",
    [startDateParam, endDateParam, driverEmailParam],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return response.status(500).json({ error: "Database error" });
      }

      // Stored procedures return [[rows], [metadata]]
      return response.send(results[0]);
    }
  );
});


/*
 * get invoices
 */
app.get("/invoices", (request, response) => {

  const { StartDate, EndDate, SponsorID } = request.query;

  //set to any date if none provided
  const startDateParam = StartDate || "2000-01-01";
  const endDateParam = EndDate || "3000-01-01";

  if(SponsorID)
  {
    db.query(
      "call SpecificSponsorInvoice(?, ?, ?);", [startDateParam, endDateParam, SponsorID],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return response.status(500).json({ error: "Database error" });
        }
        return response.send(results[0]);
      })
  }

  else
  {
    db.query(
      "call AllSponsorInvoice(?, ?);", [startDateParam, endDateParam],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return response.status(500).json({ error: "Database error" });
        }
        return response.send(results[0]);
      })
  }

});

/*
 * get driver applications
 */
app.get("/driverApplications", (request, response) => {
  const { StartDate, EndDate, SponsorID, DriverEmail } = request.query;

  // Convert empty strings or undefined to null
  const startDateParam = StartDate || null;
  const endDateParam = EndDate || null;
  const sponsorIdParam = SponsorID ? Number(SponsorID) : null;
  const driverEmailParam = DriverEmail || null;

  db.query(
    "CALL AllDriverApplications(?, ?, ?, ?)",
    [startDateParam, endDateParam, sponsorIdParam, driverEmailParam],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return response.status(500).json({ error: "Database error" });
      }

      // MySQL stored procedures return [ [rows], [meta] ]
      return response.send(results[0]);
    }
  );
});

/*
 * get password change logs
 */
app.get("/passwordChanges", (req, res) => {
  const { StartDate, EndDate, UserEmail } = req.query;

  let conditions = [];
  let values = [];

  if (StartDate) {
    conditions.push("changeDate >= ?");
    values.push(StartDate);
  }

  if (EndDate) {
    conditions.push("changeDate <= ?");
    values.push(EndDate);
  }

  if (UserEmail) {
    conditions.push("user = ?");
    values.push(UserEmail);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `SELECT * FROM PasswordChangeLogs ${whereClause} ORDER BY changeDate DESC`;

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    return res.status(200).json(results);
  });
});

/*
 * log password change event
 */
app.post("/passwordChanges", (req, res) => {
  const { user, changeType } = req.body;

  if (!user || !changeType) {
    return res.status(400).json({ error: "Missing required fields: user, changeType" });
  }

  const sql = `
    INSERT INTO PasswordChangeLogs (user, changeType)
    VALUES (?, ?)
  `;

  db.query(sql, [user, changeType], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    return res.status(201).json({ message: "Password change logged" });
  });
});

/*
 * log login attempt event
 */
app.post("/loginAttempts", (req, res) => {
  const { user, loginDate, success } = req.body;

  if (!user || !loginDate || typeof success !== "boolean") {
    return res.status(400).json({ error: "Missing required fields: user, loginDate, success (boolean)" });
  }

  const sql = `
    INSERT INTO LoginAttemptsLogs (user, loginDate, success)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [user, loginDate, success], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    return res.status(201).json({ message: "Login attempt logged" });
  });
});

/*
 * get login attempt event
 */
app.get("/loginAttempts", (req, res) => {
  const { StartDate, EndDate, UserEmail, Success } = req.query;

  let conditions = [];
  let values = [];

  if (StartDate) {
    conditions.push("loginDate >= ?");
    values.push(StartDate);
  }

  if (EndDate) {
    conditions.push("loginDate <= ?");
    values.push(EndDate);
  }

  if (UserEmail) {
    conditions.push("user = ?");
    values.push(UserEmail);
  }

  if (Success !== undefined) {
    const successValue = Success === "true" ? 1 : 0;
    conditions.push("success = ?");
    values.push(successValue);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `SELECT * FROM LoginAttemptsLogs ${whereClause} ORDER BY loginDate DESC`;

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    return res.status(200).json(results);
  });
});

/*
 * get purchases
 */
app.get("/purchases", (request, response) => {
  const { StartDate, EndDate, SponsorID, DriverEmail, SummaryDetail } = request.query;

  const startDateParam = StartDate || null;
  const endDateParam = EndDate || null;
  const sponsorIdParam = SponsorID ? Number(SponsorID) : null;
  const driverEmailParam = DriverEmail || null;
  const summaryDetailParam = SummaryDetail || "detailed"

  // Default wide date range to use if dates aren't provided
  const defaultStart = "1900-01-01";
  const defaultEnd = "2100-01-01";
  const start = StartDate ? StartDate : defaultStart;
  const end = EndDate ? EndDate : defaultEnd;

  // If SponsorID is provided (i.e. sponsor view), substitute defaults if missing.
  if (sponsorIdParam != null) {
    
    if (driverEmailParam == null) {
      db.query(
        "call SpecificSponsorPurchasees(?, ?, ?, ?);",
        [start, end, sponsorIdParam, summaryDetailParam],
        (err, results) => {
          if (err) {
            console.error("Database error:", err);
            return response.status(500).json({ error: "Database error" });
          }
          return response.send(results[0]);
        }
      );
    } else {
      db.query(
        "call SpecificDriverSpecificSponsorPurchasees(?, ?, ?, ?, ?);",
        [start, end, driverEmailParam, sponsorIdParam, summaryDetailParam],
        (err, results) => {
          if (err) {
            console.error("Database error:", err);
            return response.status(500).json({ error: "Database error" });
          }
          return response.send(results[0]);
        }
      );
    }
    return;
  }

  // Admin view (no SponsorID provided) – substitute default dates if missing.
  if (driverEmailParam == null) {
    db.query(
      "call AllPurchases(?, ?, ?);",
      [start, end, summaryDetailParam],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return response.status(500).json({ error: "Database error" });
        }
        return response.send(results[0]);
      }
    );
  } else {
    db.query(
      "call SpecificDriverAllSponsorPurchasees(?, ?, ?, ?);",
      [start, end, driverEmailParam, summaryDetailParam],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return response.status(500).json({ error: "Database error" });
        }
        return response.send(results[0]);
      }
    );
  }
});

export const handler = serverlessExpress({ app });