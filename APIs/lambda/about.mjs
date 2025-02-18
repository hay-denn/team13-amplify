import express from "express";
import serverlessExpress from "@vendia/serverless-express";
import mysql from "mysql2/promise";
const cors = require("cors");
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// not sure why but env vars arent working
const db = mysql.createPool({
  host: "team13-database.cobd8enwsupz.us-east-1.rds.amazonaws.com",
  user: "***REMOVED***",
  password: "***REMOVED***",
  database: "About",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get("/status", (request, response) => {
  const status = { "Status": "Running" };
  response.send(status);
});

/*
* Add about information to the about database (ALL team members are required)
*/
app.post("/aboutteam", async (request, response) => {
  try {
      const { TeamNumber, SprintNumber, ReleaseDate, ProductName, ProductDescription } = request.body;

      if (!TeamNumber || !SprintNumber || !ReleaseDate || !ProductName || !ProductDescription) {
          return response.status(400).json({ error: "Sprint number and all five team members are required" });
      }

      // check if the team number already exists
      const [existingRows] = await db.execute("SELECT * FROM aboutteam WHERE TeamNumber = ?;", [TeamNumber]);

      if (existingRows.length > 0) {
          return response.status(409).json({ error: "Team number already exists" });
      }

      const query = `
          INSERT INTO aboutteam (TeamNumber, SprintNumber, ReleaseDate, ProductName, ProductDescription )
          VALUES (?, ?, ?, ?, ?);
      `;

      const [result] = await db.execute(query, [TeamNumber, SprintNumber, ReleaseDate, ProductName, ProductDescription]);

      if (!result || !result.insertId) {
          return response.status(500).json({ error: "Failed to insert data" });
      }

      response.status(201).json({
          message: "About information added",
          entry: {
              id: result.insertId,
              TeamNumber,
              SprintNumber,
              ReleaseDate,
              ProductName,
              ProductDescription
          }
      });
  } catch (error) {
      console.error("Database insert error:", error);
      response.status(500).json({ error: "Internal server error" });
  }
});


/*
* Get all about information
*/
app.get("/aboutteam", async (request, response) => {
  try {
      const result = await db.query("SELECT * FROM aboutteam;");
      response.json(result[0]);
  } catch (error) {
      console.error("Database query error:", error);
      response.status(500).json({ error: "Internal server error" });
  }
});

/*
* Update about information (ALL team members are required)
*/
app.put("/aboutteam/:id", async (request, response) => {
  try {
      const { id } = request.params;
      const { TeamNumber, SprintNumber, ReleaseDate, ProductName, ProductDescription } = request.body;

      if (!TeamNumber || !SprintNumber || !ReleaseDate || !ProductName || !ProductDescription) {
          return response.status(400).json({ error: "Sprint number and all five team members are required" });
      }

      const query = `
          UPDATE aboutteam
          SET TeamNumber = ?, SprintNumber = ?, ReleaseDate = ?, ProductName = ?, ProductDescription = ?
          WHERE TeamNumber = ?;
      `;

      const [result] = await db.execute(query, [TeamNumber, SprintNumber, ReleaseDate, ProductName, ProductDescription, id]);

      if (result.affectedRows === 0) {
          return response.status(404).json({ error: "Record not found" });
      }

      const [updatedRows] = await db.execute("SELECT * FROM aboutteam WHERE TeamNumber = ?;", [id]);

      return response.json({ message: "About information updated", entry: updatedRows[0] });
  } catch (error) {
      console.error("Database update error:", error);
      return response.status(500).json({ error: "Internal server error" });
  }
});


/*
* Delete about information
*/
app.delete("/aboutteam/:id", async (request, response) => {
  try {
      const { id } = request.params;

      // Fetch the row before deleting it
      const [existingRows] = await db.execute("SELECT * FROM aboutteam WHERE TeamNumber = ?;", [id]);

      if (existingRows.length === 0) {
          return response.status(404).json({ error: "Record not found" });
      }

      const query = `DELETE FROM aboutteam WHERE TeamNumber = ?;`;
      const [result] = await db.execute(query, [id]);

      if (result.affectedRows === 0) {
          return response.status(404).json({ error: "Record not found" });
      }

      return response.json({ message: "About information deleted", deletedEntry: existingRows[0] });
  } catch (error) {
      console.error("Database delete error:", error);
      return response.status(500).json({ error: "Internal server error" });
  }
});

/*
* Add about information to the about database (ALL team members are required)
*/
app.post("/teammembers", async (request, response) => {
  try {
      const { MemberID, FirstName, LastName } = request.body;

      if (!MemberID || !FirstName || !LastName ) {
          return response.status(400).json({ error: "MemberID, FirstName, LastName are required" });
      }

      // check if the team number already exists
      const [existingRows] = await db.execute("SELECT * FROM teammembers WHERE MemeberID = ?;", [MemberID]);

      if (existingRows.length > 0) {
          return response.status(409).json({ error: "MemberID already exists" });
      }

      const query = `
          INSERT INTO teammembers (MemeberID, FirstName, LastName)
          VALUES (?, ?, ?);
      `;

      const [result] = await db.execute(query, [MemberID, FirstName, LastName]);

      if (!result || !result.insertId) {
          return response.status(500).json({ error: "Failed to insert data" });
      }

      response.status(201).json({
          message: "About information added",
          entry: {
              id: result.insertId,
              MemberID, FirstName, LastName
          }
      });
  } catch (error) {
      console.error("Database insert error:", error);
      response.status(500).json({ error: "Internal server error" });
  }
});


/*
* Get all about information
*/
app.get("/teammembers", async (request, response) => {
  try {
      const result = await db.query("SELECT * FROM teammembers;");
      response.json(result[0]);
  } catch (error) {
      console.error("Database query error:", error);
      response.status(500).json({ error: "Internal server error" });
  }
});

/*
* Update about information (ALL team members are required)
*/
app.put("/teammembers/:id", async (request, response) => {
  try {
      const { id } = request.params;
      const { MemberID, FirstName, LastName } = request.body;

      if (!MemberID || !FirstName || !LastName ) {
          return response.status(400).json({ error: "Sprint number and all five team members are required" });
      }

      const query = `
          UPDATE teammembers
          SET MemeberID = ?, FirstName = ?, LastName = ?
          WHERE MemeberID = ?;
      `;

      const [result] = await db.execute(query, [MemberID, FirstName, LastName , id]);

      if (result.affectedRows === 0) {
          return response.status(404).json({ error: "Record not found" });
      }

      // Since MySQL does not support RETURNING *, fetch the updated row manually
      const [updatedRows] = await db.execute("SELECT * FROM teammembers WHERE MemeberID = ?;", [id]);

      return response.json({ message: "About information updated", entry: updatedRows[0] });
  } catch (error) {
      console.error("Database update error:", error);
      return response.status(500).json({ error: "Internal server error" });
  }
});


/*
* Delete about information
*/
app.delete("/teammembers/:id", async (request, response) => {
  try {
      const { id } = request.params;

      // Fetch the row before deleting it
      const [existingRows] = await db.execute("SELECT * FROM teammembers WHERE MemeberID = ?;", [id]);

      if (existingRows.length === 0) {
          return response.status(404).json({ error: "Record not found" });
      }

      const query = `DELETE FROM teammembers WHERE MemeberID = ?;`;
      const [result] = await db.execute(query, [id]);

      if (result.affectedRows === 0) {
          return response.status(404).json({ error: "Record not found" });
      }

      return response.json({ message: "About information deleted", deletedEntry: existingRows[0] });
  } catch (error) {
      console.error("Database delete error:", error);
      return response.status(500).json({ error: "Internal server error" });
  }
});

export const handler = serverlessExpress({ app });
