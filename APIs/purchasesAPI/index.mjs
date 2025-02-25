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
 *  Add purchase
 */
app.post("/purchase", (request, response) => {
  const { PurchaseDriver, PurchaseDate, PurchaseStatus} = request.body;

  if (!PurchaseDriver || !PurchaseDate || !PurchaseStatus) {
    return response.status(400).json({
      error: 'PurchaseDriver, PurchaseDate, and PurchaseStatus are required',
    });
  }

  db.query(
    "INSERT INTO DRS.purchases (PurchaseDriver, PurchaseDate, \
	  	PurchaseStatus) \
	  VALUES (?, ?, ?)",
    [PurchaseDriver, PurchaseDate, PurchaseStatus],
    (err, insertResults) => {
      if (err) {
        console.error("Database insert error:", err);
        return response.status(500).json({ error: 'Database insert error' });
      }

      response.status(201).json({
        message: 'Purchase created',
        user: { PurchaseDriver, PurchaseDate, PurchaseStatus }
      });
    }
  );
});

/*
 * get specific purchase
 */
app.get("/purchase", (request, response) => {
  const { PurchaseID } = request.body;

  if (!PurchaseID) {
    return response.status(400).json({ error: 'PurchaseID required' });
  }

  db.query("SELECT * FROM DRS.purchases WHERE PurchaseID = ?", [PurchaseID], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Purchase not found' });
    }

    return response.send(results[0]);
  });
});

/*
 * get all purchases
 */
app.get("/purchases", (request, response) => {

  db.query(
    "SELECT * FROM DRS.purchases",
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return response.status(500).json({ error: "Database error" });
      }
      return response.send(results);
    })

});


/*
 * update purchase
 */
app.put("/purchase", (request, response) => {
  const { PurchaseID, PurchaseDriver, PurchaseDate, PurchaseStatus} = request.body;

  if (!PurchaseID) {
    return response.status(400).json({ error: 'PurchaseID required' });
  }

  db.query("SELECT * FROM DRS.purchases WHERE PurchaseID = ?", [PurchaseID], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Purchase not found' });
    }

    const updates = [];
    const values = [];

    if (PurchaseDrive) {
      updates.push("PurchaseDriver = ?");
      values.push(PurchaseDriver);
    }

    if (PurchaseDate) {
      updates.push("PurchaseDate = ?");
      values.push(PurchaseDate);
    }

	  if (PurchaseStatus) {
	    updates.push("PurchaseStatus = ?");
	    values.push(PurchaseStatus);
	  }
  
    if (updates.length === 0) {
      return response.json({ message: 'No changes provided' });
    }

    const updateQuery = `UPDATE DRS.purchases SET ${updates.join(", ")} WHERE PurchaseID = ?`;
    values.push(PurchaseID); 

    db.query(updateQuery, values, (updateErr, updateResults) => {
      if (updateErr) {
        console.error("Database update error:", updateErr);
        return response.status(500).json({ error: 'Database update error' });
      }

      db.query("SELECT * FROM purchases WHERE PurchaseID = ?", [PurchaseID], (selErr, selResults) => {
        if (selErr) {
          console.error("Database select error:", selErr);
          return response.status(500).json({ error: 'Database select error after update' });
        }

        return response.status(201).json({
          message: 'Purchase updated',
          user: selResults[0]
        });
      });
    });
  });
});

/*
 * delete a purchase
 */
app.delete("/purchase", (request, response) => {
  const { PurchaseID } = request.body;
  if (!PurchaseID) {
    return response.status(400).json({ error: 'PurchaseID required' });
  }
  db.query("SELECT * FROM DRS.purchases WHERE PurchaseID = ?", [PurchaseID], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Purchase not found' });
    }

    const userToDelete = results[0];

    db.query("DELETE FROM DRS.purchases WHERE PurchaseID = ?", [PurchaseID], (deleteErr, deleteResults) => {
      if (deleteErr) {
        console.error("Database delete error:", deleteErr);
        return response.status(500).json({ error: 'Database delete error' });
      }

      return response.send({
        message: 'Purchase deleted',
        user: userToDelete
      });
    });
  });
});

/*
 * get purchase count
 */
app.get("/purchase_count", (request, response) => {

    db.query(
      "SELECT COUNT(*) AS count FROM DRS.purchases",
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