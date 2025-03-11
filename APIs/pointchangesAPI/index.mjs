import express from "express";
import serverlessExpress from "@vendia/serverless-express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const validPointChangeActions = ["Add", "Subtract", "Set"];

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

/*
 *  Add amin
 */
app.post("/pointchange", (request, response) => {
  const { PointChangeDriver, PointChangeSponsor, PointChangeNumber, 
    PointChangeAction} = request.body;

  const PointChangeDate = new Date().toISOString().split('T')[0];

  if (PointChangeAction && !validPointChangeActions.includes(PointChangeAction)) {
    return response.status(400).json({
      error: 'PointChangeAction must be one of Add, Subtract, or Set'
    });
  }
  
  if (!PointChangeDriver || !PointChangeSponsor || !PointChangeNumber || !PointChangeAction) {
    return response.status(400).json({
      error: 'PointChangeDriver, PointChangeSponsor, PointChangeNumb, and PointChangeAction are required'
    });
  }

  // check driver exists
  db.query("SELECT * FROM DRS.drivers WHERE DriverEmail = ?", [PointChangeDriver], (err, results) => {
    if (err) {
      console.error("Database select error on drivers:", err);
      return response.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return response.status(400).json({ error: 'Driver does not exist' });
    }
  }
  );

  // check sponsor exists
  db.query("SELECT * FROM DRS.sponsororganizations WHERE OrganizationName = ?", [PointChangeSponsor], (err, results) => {
    if (err) {
      console.error("Database select error on sponsors:", err);
      return response.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return response.status(400).json({ error: 'Sponsor does not exist' });
    }
  }
  );

  db.query(
    "INSERT INTO DRS.pointchanges (PointChangeDriver, PointChangeSponsor, \
    PointChangeNumber, PointChangeAction, PointChangeDate \
    ) VALUES (?, ?, ?, ?, ?)",
    [PointChangeDriver, PointChangeSponsor, PointChangeNumber, PointChangeAction,
      PointChangeDate
    ],
    (err) => {
      if (err) {
        console.error("Database insert error:", err);
        return response.status(500).json({ error: 'Database insert error',
          message: err.message
        });
      }

      response.status(201).json({
        message: 'Point change created',
        user: { PointChangeDriver, PointChangeSponsor, PointChangeNumber,
          PointChangeAction, PointChangeDate
        }
      });
    }
  );
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

  db.query(
    "SELECT * FROM DRS.pointchanges",
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return response.status(500).json({ error: "Database error" });
      }
      return response.send(results);
    })

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