import express from "express";
import serverlessExpress from "@vendia/serverless-express";
import mysql from "mysql2";

const app = express();
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

/*
 * get all applications
 */
app.get("/", (request, response) => {
  db.query("SELECT * FROM DRS.driversponsorapplications", (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'No applications exist' });
    }

    return response.send(results);
  });
});

/*
 * get applications by specific driver
 */
app.get("/driver", (request, response) => {
  const { DriverEmail } = request.body;

  if (!DriverEmail) {
    return response.status(400).json({ error: 'DriverEmail required' });
  }

  db.query("SELECT * FROM DRS.driversponsorapplications WHERE ApplicationDriver = ?", [DriverEmail], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Driver has no applications' });
    }

    return response.send(results[0]);
  });
});

/*
 * get applications by specific organization
 */
app.get("/organization", (request, response) => {
  const { OrganizationID } = request.body;

  if (!DriverEmail) {
    return response.status(400).json({ error: 'OrganizationID required' });
  }

  db.query("SELECT * FROM DRS.driversponsorapplications WHERE ApplicationOrganization = ?", [OrganizationID], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Organization has no applications' });
    }

    return response.send(results[0]);
  });
});

/*
 * get applications by specific sponsor user
 */
app.get("/sponsoruser", (request, response) => {
  const { SponsorEmail } = request.body;

  if (!DriverEmail) {
    return response.status(400).json({ error: 'Sponsor Email required' });
  }

  db.query("SELECT * FROM DRS.driversponsorapplications WHERE ApplicationSponsorUser = ?", [SponsorEmail], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Sponsor User has no applications' });
    }

    return response.send(results[0]);
  });
});

/*
 * get applications by specific sponsor user in organization
 */
app.get("/organization/sponsoruser", (request, response) => {
  const { OrganizationID, SponsorEmail } = request.body;

  if (!OrganizationID) {
    return response.status(400).json({ error: 'Organization required' });
  }
  if(!SponsorEmail){
    return response.status(400).json({error: "Sponsor User required"})
  }

  db.query("SELECT * FROM DRS.driversponsorapplications WHERE ApplicationOrganization = ? AND ApplicationSponsorUser = ?", [OrganizationID, SponsorEmail], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Sponsor User has no applications' });
    }

    return response.send(results[0]);
  });
});

export const handler = serverlessExpress({ app });