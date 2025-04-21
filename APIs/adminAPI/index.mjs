import express from "express";
import serverlessExpress from "@vendia/serverless-express";
import mysql from "mysql2";
import cors from "cors";

const app = express();  
app.use(cors({ origin: "*" }));
app.use(express.json());

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

/*
 *  Add amin
 */
app.post("/admin", (request, response) => {
  const { AdminEmail, AdminFName, AdminLName} = request.body;

  const UserType = "Admin";

  if (!AdminEmail || !AdminFName || !AdminLName) {
    return response.status(400).json({
      error: 'AdminEmail, AdminLName, and AdminEmail are required',
    });
  }

  db.query("SELECT * FROM admins WHERE AdminEmail = ?", [AdminEmail], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      return response.status(400).json({ error: 'user already exists' });
    }

    db.query(
      "INSERT INTO admins (AdminFName, AdminLName, AdminEmail) VALUES (?, ?, ?)",
      [AdminFName, AdminLName, AdminEmail],
      (err, insertResults) => {
        if (err) {
          console.error("Database insert error:", err);
          return response.status(500).json({ error: 'Database insert error' });
        }

        return response.status(201).json({
          message: 'User created',
          user: { AdminFName, AdminLName, AdminEmail, UserType }
        });
      }
    );
  });
});

/*
 * get specific admin
 */
app.get("/admin", (request, response) => {
  const { AdminEmail } = request.query; // Extract from URL query parameters

  if (!AdminEmail) {
    return response.status(400).json({ error: "AdminEmail required" });
  }

  db.query("SELECT * FROM admins WHERE AdminEmail = ?", [AdminEmail], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: "User not found" });
    }

    return response.json(results[0]); // Send response as JSON
  });
});

/*
 * get all admins
 */
app.get("/admins", (request, response) => {

  db.query(
    "SELECT * FROM admins",
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return response.status(500).json({ error: "Database error" });
      }
      return response.send(results);
    })

});


/*
 * update admin
 */
app.put("/admin", (request, response) => {
  const { AdminEmail, AdminFName, AdminLName} = request.body;

  if (!AdminEmail) {
    return response.status(400).json({ error: 'AdminEmail required' });
  }

  db.query("SELECT * FROM admins WHERE AdminEmail = ?", [AdminEmail], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'user not found' });
    }

    const updates = [];
    const values = [];

    if (AdminFName) {
      updates.push("AdminFName = ?");
      values.push(AdminFName);
    }

    if (AdminLName) {
      updates.push("AdminLName = ?");
      values.push(AdminLName);
    }

    if (updates.length === 0) {
      return response.json({ message: 'No changes provided' });
    }

    const updateQuery = `UPDATE admins SET ${updates.join(", ")} WHERE AdminEmail = ?`;
    values.push(AdminEmail); 

    db.query(updateQuery, values, (updateErr, updateResults) => {
      if (updateErr) {
        console.error("Database update error:", updateErr);
        return response.status(500).json({ error: 'Database update error' });
      }

      db.query("SELECT * FROM admins WHERE AdminEmail = ?", [AdminEmail], (selErr, selResults) => {
        if (selErr) {
          console.error("Database select error:", selErr);
          return response.status(500).json({ error: 'Database select error after update' });
        }

        return response.json({
          message: 'Admin updated',
          user: selResults[0]
        });
      });
    });
  });
});

/*
 * delete a user
 */
app.delete("/admin", (request, response) => {
  const { AdminEmail } = request.query;
  if (!AdminEmail) {
    return response.status(400).json({ error: 'AdminEmail required' });
  }

  db.query("SELECT * FROM admins WHERE AdminEmail = ?", [AdminEmail], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'admin not found' });
    }

    const userToDelete = results[0];

    db.query("DELETE FROM admins WHERE AdminEmail = ?", [AdminEmail], (deleteErr, deleteResults) => {
      if (deleteErr) {
        console.error("Database delete error:", deleteErr);
        return response.status(500).json({ error: 'Database delete error' });
      }

      return response.send({
        message: 'Admin deleted',
        user: userToDelete
      });
    });
  });
});

/*
 * get user count
 */
app.get("/admin_count", (request, response) => {

    db.query(
      "SELECT COUNT(*) AS count FROM admins",
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


