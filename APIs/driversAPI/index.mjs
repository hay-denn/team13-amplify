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
 *  Add amin
 */
app.post("/driver", (request, response) => {
  const { DriverEmail, DriverFName, DriverLName } = request.body;

  const UserType = "Driver";

  if (!DriverEmail || !DriverFName || !DriverLName) {
    return response.status(400).json({
      error: 'DriverFName, DriverLName, and DriverEmail are required',
    });
  }

  db.query("SELECT * FROM drivers WHERE DriverEmail = ?", [DriverEmail], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      return response.status(400).json({ error: 'user already exists' });
    }

    db.query(
      "INSERT INTO drivers (DriverFName, DriverLName, \
			DriverEmail) \
			VALUES (?, ?, ?)",
      [DriverFName, DriverLName, DriverEmail],
      (err, insertResults) => {
        if (err) {
          console.error("Database insert error:", err);
          return response.status(500).json({ error: 'Database insert error' });
        }

        response.status(201).json({
          message: 'User created',
          user: { DriverFName, DriverLName, DriverEmail }
        });
      }
    );
  });
});

/*
 * get specific driver
 */
app.get("/driver", (request, response) => {
  const { DriverEmail } = request.query;

  if (!DriverEmail) {
    return response.status(400).json({ error: 'DriverEmail required' });
  }

  db.query("SELECT * FROM drivers WHERE DriverEmail = ?", [DriverEmail], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'user not found' });
    }

    return response.send(results[0]);
  });
});

/*
 * get all drivers
 */
app.get("/drivers", (request, response) => {

  db.query(
    "SELECT * FROM drivers",
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return response.status(500).json({ error: "Database error" });
      }
      return response.send(results);
    })

});


/*
 * update driver
 */
app.put("/driver", (request, response) => {
  const { DriverEmail, DriverFName, DriverLName} = request.body;

  if (!DriverEmail) {
    return response.status(400).json({ error: 'DriverEmail required' });
  }

  db.query("SELECT * FROM drivers WHERE DriverEmail = ?", [DriverEmail], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'user not found' });
    }

    const updates = [];
    const values = [];

    if (DriverFName) {
      updates.push("DriverFName = ?");
      values.push(DriverFName);
    }

    if (DriverLName) {
      updates.push("DriverLName = ?");
      values.push(DriverLName);
    }
  
    if (updates.length === 0) {
      return response.json({ message: 'No changes provided' });
    }

    const updateQuery = `UPDATE drivers SET ${updates.join(", ")} WHERE DriverEmail = ?`;
    values.push(DriverEmail); 

    db.query(updateQuery, values, (updateErr, updateResults) => {
      if (updateErr) {
        console.error("Database update error:", updateErr);
        return response.status(500).json({ error: 'Database update error' });
      }

      db.query("SELECT * FROM drivers WHERE DriverEmail = ?", [DriverEmail], (selErr, selResults) => {
        if (selErr) {
          console.error("Database select error:", selErr);
          return response.status(500).json({ error: 'Database select error after update' });
        }

        return response.json({
          message: 'driver updated',
          user: selResults[0]
        });
      });
    });
  });
});

/*
 * delete a user
 */
app.delete("/driver", (request, response) => {
  const { DriverEmail } = request.query;
  if (!DriverEmail) {
    return response.status(400).json({ error: 'DriverEmail required' });
  }

  db.query("SELECT * FROM drivers WHERE DriverEmail = ?", [DriverEmail], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'driver not found' });
    }

    const userToDelete = results[0];

    db.query("DELETE FROM drivers WHERE DriverEmail = ?", [DriverEmail], (deleteErr, deleteResults) => {
      if (deleteErr) {
        console.error("Database delete error:", deleteErr);
        return response.status(500).json({ error: 'Database delete error' });
      }

      return response.send({
        message: 'driver deleted',
        user: userToDelete
      });
    });
  });
});

/*
 * get user count
 */
app.get("/driver_count", (request, response) => {

    db.query(
      "SELECT COUNT(*) AS count FROM drivers",
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

