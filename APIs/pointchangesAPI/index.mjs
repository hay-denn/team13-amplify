import express from "express";
import serverlessExpress from "@vendia/serverless-express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const validPointChangeActions = ["Add", "Subtract", "Set"];

// not sure why but env vars arent working
const db = mysql.createPool({
  host: process.env.DB_URL,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: "DRS",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get("/status", (request, response) => {
	const status = {
		"Status": "Running"
	};
	response.send(status);
});

app.post("/pointchange", async (request, response) => {
  const {
    PointChangeDriver,
    PointChangeSponsor,
    PointChangeNumber,
    PointChangeAction,
    PointChangeReason, // <-- new field
  } = request.body;
  const PointChangeDate = new Date().toISOString().split("T")[0];

  if (PointChangeAction && !validPointChangeActions.includes(PointChangeAction)) {
    return response
      .status(400)
      .json({ error: "PointChangeAction must be one of Add, Subtract, or Set" });
  }

  if (!PointChangeDriver || !PointChangeSponsor || !PointChangeNumber || !PointChangeAction) {
    return response.status(400).json({
      error:
        "PointChangeDriver, PointChangeSponsor, PointChangeNumber, and PointChangeAction are required",
    });
  }

  try {
    const [driverResults] = await db.promise().query(
      "SELECT * FROM DRS.drivers WHERE DriverEmail = ?",
      [PointChangeDriver]
    );
    if (driverResults.length === 0) {
      return response.status(400).json({ error: "Driver does not exist" });
    }

    const [sponsorResults] = await db.promise().query(
      "SELECT * FROM DRS.sponsorusers WHERE UserEmail = ?",
      [PointChangeSponsor]
    );
    if (sponsorResults.length === 0) {
      return response.status(400).json({ error: "Sponsor does not exist" });
    }

    await db.promise().query(
      "INSERT INTO DRS.pointchanges (PointChangeDriver, PointChangeSponsor, PointChangeNumber, PointChangeAction, PointChangeDate, PointChangeReason) VALUES (?, ?, ?, ?, ?, ?)",
      [
        PointChangeDriver,
        PointChangeSponsor,
        PointChangeNumber,
        PointChangeAction,
        PointChangeDate,
        PointChangeReason,
      ]
    );

    return response.status(201).json({
      message: "Point change created",
      user: {
        PointChangeDriver,
        PointChangeSponsor,
        PointChangeNumber,
        PointChangeAction,
        PointChangeDate,
        PointChangeReason, 
      },
    });
  } catch (err) {
    console.error("Database error:", err);
    return response.status(500).json({ error: "Database error", message: err.message });
  }
});


/*
 * get specific organization
 */
app.get("/pointchange", (request, response) => {
  const { PointChangeID } = request.query;

  if (!PointChangeID) {
    return response.status(400).json({ error: "PointChangeID required" });
  }

  db.query("SELECT * FROM DRS.pointchanges WHERE PointChangeID = ?", 
    [PointChangeID], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error'});
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Point change not found' });
    }

    return response.send(results[0]);
  });
});

/*
 * get all organizations
 */
app.get("/pointchanges", (request, response) => {
  const { PointChangeDriver } = request.query;

  let sql = `
    SELECT
      pc.*,
      su.UserOrganization      AS organizationID,
      org.OrganizationName     AS organizationName
    FROM DRS.pointchanges pc

    LEFT JOIN DRS.sponsorusers su
      ON pc.PointChangeSponsor = su.UserEmail

    LEFT JOIN DRS.sponsororganizations org
      ON su.UserOrganization = org.OrganizationID
  `;
  const params = [];

  if (PointChangeDriver) {
    sql += " WHERE pc.PointChangeDriver = ?";
    params.push(PointChangeDriver);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: "Database error",
    err: err });
    }
    response.json(results);
  });
});



/*
 * delete an organization
 */
app.delete("/pointchange", (request, response) => {
  const { PointChangeID } = request.query;
  
  if (!PointChangeID) {
    return response.status(400).json({ error: 'PointChangeID required' });
  }

  db.query("SELECT * FROM DRS.pointchanges WHERE PointChangeID = ?", [PointChangeID], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'point change not found' });
    }

    const pointChangeToDelete = results[0];

    db.query("DELETE FROM DRS.pointchanges WHERE PointChangeID = ?", [PointChangeID], (deleteErr) => {
      if (deleteErr) {
        console.error("Database delete error:", deleteErr);
        return response.status(500).json({ error: 'Database delete error' });
      }

      return response.send({
        message: 'Point change deleted',
        PointChangeID: PointChangeID
      });
    });
  });
});

/*
 * get user count
 */
app.get("/pointchanges_count", (request, response) => {

    db.query(
      "SELECT COUNT(*) AS count FROM DRS.pointchanges",
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return response.status(500).json({ error: 'Database error' });
        }
        return response.send({ count: results[0].count });
      }
	)
	
});

export const handler = serverlessExpress({ app });