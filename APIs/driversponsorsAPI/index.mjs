import express from "express";
import serverlessExpress from "@vendia/serverless-express";
import mysql from "mysql2";
import cors from "cors";

const app = express();  
app.use(cors({ origin: "*" }));
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
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
 *  Add driver sponsor relationship
 */
app.post("/driverssponsor", (request, response) => {
  const { DriversEmail, DriversSponsorID } = request.body;

  if (!DriversEmail || !DriversSponsorID) {
    return response.status(400).json({
      error: 'DriversEmail and DriversSponsorID are required'
    });
  }

  // Check if relationship already exists
  db.query(
    "SELECT * FROM DRS.driverssponsors WHERE DriversEmail = ? AND DriversSponsorID = ?",
    [DriversEmail, DriversSponsorID],
    (err, results) => {
      if (err) {
        console.error("Database select error:", err);
        return response.status(500).json({ error: 'Database error on driverssponsors' });
      }

      if (results.length > 0) {
        return response.status(400).json({ error: 'Relationship already exists' });
      }

      db.query(
        "INSERT INTO DRS.driverssponsors (DriversEmail, DriversSponsorID) VALUES (?, ?)",
        [DriversEmail, DriversSponsorID],
        (err, insertResults) => {
          if (err) {
            switch (err.code) {
              case "ER_DUP_ENTRY":
                return response.status(400).json({ error: "Relationship already exists (duplicate entry)." });
              case "ER_NO_REFERENCED_ROW_2":
                return response.status(400).json({ error: "Foreign key constraint fails: DriversEmail or DriversSponsorID does not exist." });
              case "ER_ROW_IS_REFERENCED_2":
                return response.status(400).json({ error: "Operation not allowed due to foreign key constraints." });
              default:
                console.error("Database insert error:", err);
                return response.status(500).json({ error: "Database insert error", code: err.code });
            }
          }

          return response.status(201).json({
            message: 'Relationship added',
            user: { DriversEmail, DriversSponsorID }
          });
        }
      );
    }
  );
});


/*
 * get specific relationship
 */
app.get("/driverssponsor", (request, response) => {
  const { DriversEmail, DriversSponsorID } = request.query;

  if (!DriversEmail || !DriversSponsorID) {
    return response.status(400).json({ error: 'DriversEmail and DriversSponsorID required' });
  }

  db.query("SELECT * FROM DRS.driverssponsors WHERE DriversEmail = ? AND DriversSponsorID = ?", [DriversEmail, DriversSponsorID], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Relationship not found' });
    }

    return response.send(results[0]);
  });
});

/*
 * Get all relationships, with optional filtering by DriversEmail and/or DriversSponsorID
 */
app.get("/driverssponsors", (request, response) => {
  const { DriversEmail, DriversSponsorID } = request.query;

  if (DriversEmail && DriversSponsorID) {
    // Both parameters provided: filter on both
    db.query(
      "SELECT * FROM DRS.driverssponsors WHERE DriversEmail = ? AND DriversSponsorID = ?",
      [DriversEmail, DriversSponsorID],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return response.status(500).json({ error: "Database error" });
        }
        if (results.length === 0) {
          return response.status(400).json({ error: "No matching sponsorship relationships found" });
        }
        return response.send(results);
      }
    );
  } else if (DriversEmail) {
    // Only DriversEmail provided
    db.query(
      "SELECT * FROM DRS.driverssponsors WHERE DriversEmail = ?",
      [DriversEmail],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return response.status(500).json({ error: "Database error" });
        }
        if (results.length === 0) {
          return response.status(400).json({ error: "Driver has no sponsors" });
        }
        return response.send(results);
      }
    );
  } else if (DriversSponsorID) {
    // Only DriversSponsorID provided
    db.query(
      "SELECT * FROM DRS.driverssponsors WHERE DriversSponsorID = ?",
      [DriversSponsorID],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return response.status(500).json({ error: "Database error" });
        }
        if (results.length === 0) {
          return response.status(400).json({ error: "Sponsor has no drivers" });
        }
        return response.send(results);
      }
    );
  } else {
    // No query parameters provided: return all records.
    db.query("SELECT * FROM DRS.driverssponsors", (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return response.status(500).json({ error: "Database error" });
      }
      return response.send(results);
    });
  }
});


/*
 * delete a relationship
 */
app.delete("/driverssponsor", (request, response) => {
  const { DriversEmail, DriversSponsorID } = request.query;

  if (!DriversEmail || !DriversSponsorID) {
    return response.status(400).json({ error: 'DriversEmail and DriversSponsorID required' });
  }

  db.query("SELECT * FROM DRS.driverssponsors WHERE DriversEmail = ? AND DriversSponsorID = ?", [DriversEmail, DriversSponsorID], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Relationship not found' });
    }

    const userToDelete = results[0];

    db.query("DELETE FROM DRS.driverssponsors WHERE DriversEmail = ? AND DriversSponsorID = ?", [DriversEmail, DriversSponsorID], (deleteErr, deleteResults) => {
      if (deleteErr) {
        console.error("Database delete error:", deleteErr);
        return response.status(500).json({ error: 'Database delete error' });
      }

      return response.send({
        message: 'Relationship deleted',
        user: userToDelete
      });
    });
  });
});

/*
 * get relationship count
 */
app.get("/driverssponsors_count", (request, response) => {

  const { DriversEmail, DriversSponsorID } = request.query;

  if(DriversEmail){
    db.query(
      "SELECT COUNT(*) AS count FROM DRS.driverssponsors WHERE DriversEmail = ?", [DriversEmail],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return response.status(500).json({ error: 'Database error' });
        }
        return response.send({ SponsorCount: results[0].count });
      }
	  )
  }

  else if(DriversSponsorID){
    db.query(
      "SELECT COUNT(*) AS DriverCount FROM DRS.driverssponsors WHERE DriversSponsorID = ?", [DriversSponsorID],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return response.status(500).json({ error: 'Database error' });
        }
        return response.send({ DriverCount: results[0].DriverCount });
      }
	  )
  }

  else{
    db.query(
      "SELECT COUNT(*) AS count FROM DRS.driverssponsors",
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return response.status(500).json({ error: 'Database error' });
        }
        return response.send({ count: results[0].count });
      }
	  )
  } 
	
});

export const handler = serverlessExpress({ app });