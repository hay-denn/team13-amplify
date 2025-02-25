import express from "express";
import serverlessExpress from "@vendia/serverless-express";
import mysql from "mysql2";
import cors from "cors";

const app = express();  
app.use(cors({ origin: "*" }));
app.use(express.json());

// not sure why but env vars arent working
const db = mysql.createPool({
  host: "team13-database.cobd8enwsupz.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "pw4Team13RDSDatabase",
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
app.post("/organization", (request, response) => {
  const {OrganizationName} = request.body;

  if (!OrganizationName) {
    return response.status(400).json({
      error: 'OrganizationName is required',
    });
  }

  db.query("SELECT * FROM DRS.sponsororganizations WHERE OrganizationName = ?", [OrganizationName], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      return response.status(400).json({ error: 'Organization already exists' });
    }

    db.query(
      "INSERT INTO DRS.sponsororganizations (OrganizationName) \
	  VALUES (?)",
      [OrganizationName],
      (err, insertResults) => {
        if (err) {
          console.error("Database insert error:", err);
          return response.status(500).json({ error: 'Database insert error' });
        }

        response.status(201).json({
          message: 'Organization created',
          user: { OrganizationName }
        });
      }
    );
  });
});

/*
 * get specific organization
 */
app.get("/organization", (request, response) => {
  const { OrganizationID } = request.body;

  if (!OrganizationID) {
    return response.status(400).json({ error: "OrganizationID required" });
  }

  db.query("SELECT * FROM DRS.sponsororganizations WHERE OrganizationID = ?", [OrganizationID], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error'});
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Organizaiton not found' });
    }

    return response.send(results[0]);
  });
});

/*
 * get all organizations
 */
app.get("/organizations", (request, response) => {

  db.query(
    "SELECT * FROM DRS.sponsororganizations",
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return response.status(500).json({ error: "Database error" });
      }
      return response.send(results);
    })

});


/*
 * update organization
 */
app.put("/organization", (request, response) => {
  const {OrganizationID, OrganizationName} = request.body;

  if (!OrganizationID) {
    return response.status(400).json({ error: 'OrganizationID required' });
  }

  db.query("SELECT * FROM DRS.sponsororganizations WHERE OrganizationID = ?", [OrganizationID], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Organization not found' });
    }

    const updates = [];
    const values = [];

    if (OrganizationName) {
      updates.push("OrganizationName = ?");
      values.push(OrganizationName);
    }
  
    if (updates.length === 0) {
      return response.json({ message: 'No changes provided' });
    }

    const updateQuery = `UPDATE DRS.sponsororganizations SET ${updates.join(", ")} WHERE OrganizationID = ?`;
    values.push(OrganizationID); 

    db.query(updateQuery, values, (updateErr, updateResults) => {
      if (updateErr) {
        console.error("Database update error:", updateErr);
        return response.status(500).json({ error: 'Database update error' });
      }

      db.query("SELECT * FROM DRS.sponsororganizations WHERE OrganizationID = ?", [OrganizationID], (selErr, selResults) => {
        if (selErr) {
          console.error("Database select error:", selErr);
          return response.status(500).json({ error: 'Database select error after update' });
        }

        return response.status(201).json({
          message: 'Organization updated',
          user: selResults[0]
        });
      });
    });
  });
});

/*
 * delete an organization
 */
app.delete("/organization", (request, response) => {
  const { OrganizationID } = request.body;
  
  if (!OrganizationID) {
    return response.status(400).json({ error: 'OrganizationID required' });
  }

  db.query("SELECT * FROM DRS.sponsororganizations WHERE OrganizationID = ?", [OrganizationID], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Organization not found' });
    }

    const userToDelete = results[0];

    db.query("DELETE FROM DRS.sponsororganizations WHERE OrganizationID = ?", [OrganizationID], (deleteErr, deleteResults) => {
      if (deleteErr) {
        console.error("Database delete error:", deleteErr);
        return response.status(500).json({ error: 'Database delete error' });
      }

      return response.send({
        message: 'Organization deleted',
        user: userToDelete
      });
    });
  });
});

/*
 * get user count
 */
app.get("/organization_count", (request, response) => {

    db.query(
      "SELECT COUNT(*) AS count FROM DRS.sponsororganizations",
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