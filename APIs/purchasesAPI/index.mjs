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
 *  Add purchase
 */
app.post("/purchase", (request, response) => {
  const { PurchaseDriver, PurchaseDate, PurchaseStatus, PurchaseSponsorID } = request.body;

  if (!PurchaseDriver || !PurchaseDate || !PurchaseStatus || !PurchaseSponsorID) {
    return response.status(400).json({
      error: 'PurchaseDriver, PurchaseDate, PurchaseStatus, and PurchaseSponsorID are required',
    });
  }

  db.query(
    `INSERT INTO DRS.purchases (PurchaseDriver, PurchaseDate, PurchaseStatus, PurchaseSponsorID)
    VALUES (?, ?, ?, ?)`,
    [PurchaseDriver, PurchaseDate, PurchaseStatus, PurchaseSponsorID],
    (err, insertResults) => {
      if (err) {
        console.error("Database insert error on purchases:", err);

        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
          return response.status(400).json({ error: 'Driver or Sponsor does not exist' });
        }

        return response.status(500).json({ error: 'Database insert error' });
      }

      const newPurchaseID = insertResults.insertId;

      response.status(201).json({
        message: 'Purchase created',
        PurchaseID: newPurchaseID,
        details: { PurchaseDriver, PurchaseDate, PurchaseStatus }
      });
    }
  );
});


/*
 * get specific purchase
 */
app.get("/purchase", (request, response) => {
  const { PurchaseID } = request.query;

  if (!PurchaseID) {
    return response.status(400).json({ error: 'PurchaseID required' });
  }

  db.query(`SELECT 
      p.PurchaseID,
      p.PurchaseDriver,
      p.PurchaseDate,
      p.PurchaseStatus,
      p.PurchaseSponsorID,
      GROUP_CONCAT(pp.ProductPurchasedID) AS ProductPurchasedID,
      GROUP_CONCAT(pp.ProductPurchaseQuantity) AS ProductPurchaseQuantity
    FROM DRS.purchases p 
    LEFT JOIN DRS.productspurchased pp ON p.PurchaseID = pp.PurchaseAssociatedID
    WHERE p.PurchaseID = ?
    GROUP BY p.PurchaseID;
    `, [PurchaseID], (err, results) => {
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
 * get specific purchase price
 */
app.get("/purchasePrice", (request, response) => {
  const { PurchaseID } = request.query;

  if (!PurchaseID) {
    return response.status(400).json({ error: 'PurchaseID required' });
  }

  let productsPurchased = [];

  db.query(`select ProductPurchasedID from DRS.productspurchased where PurchaseAssociatedID = ?;`,
  [PurchaseID], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Purchase not found or no products associated with purchase' });
    }

    let productsPurchased = [];

    for(let i = 0; i < results.length; i++)
    {
      productsPurchased.push(results[i].ProductPurchasedID)
    }

    let price = 0.0

    for(let i = 0; i < productsPurchased.length; i++){
      let path = 'https://itunes.apple.com/lookup?id=';

      path = path + productsPurchased[i];
      
      const axios = require('axios');

      exports.handler = async (event) => {
        const id = productsPurchased[i];
        const url = `https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}`;

        try {
          const response = await axios.get(url);
          const data = response.data;

          return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: {
              'Content-Type': 'application/json',
            },
          };
        } catch (error) {
          console.error('Error fetching data from iTunes API:', error);

          return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
            headers: {
              'Content-Type': 'application/json',
            },
          };
        }
      };

    }

    return response.status(200).json({ message: 'Done' });
  });
});

/*
 * get all purchases
 */
app.get("/purchases", (request, response) => {
  let { PurchaseDriver, PurchaseSponsorID } = request.query;

  let query = "SELECT * FROM DRS.purchases";
  const params = [];
  const conditions = [];

  if (PurchaseDriver) {
    conditions.push("TRIM(LOWER(PurchaseDriver)) = TRIM(LOWER(?))");
    params.push(PurchaseDriver);
  }

  if (PurchaseSponsorID) {
    conditions.push("PurchaseSponsorID = ?");
    params.push(PurchaseSponsorID);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }
    return response.send(results);
  });
});



/*
 * update purchase
 */
app.put("/purchase", async (request, response) => {
  const { PurchaseID, PurchaseDriver, PurchaseDate, PurchaseStatus, PurchaseSponsorID } = request.body;

  if (!PurchaseID) {
    return response.status(400).json({ error: 'PurchaseID required' });
  }

  db.query("SELECT * FROM DRS.purchases WHERE PurchaseID = ?", [PurchaseID], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Purchase not found' });
    }

    const updates = [];
    const values = [];

    // Corrected typo: PurchaseDriver
    if (PurchaseDriver) {
      try {
        const driverResults = await new Promise((resolve, reject) => {
          db.query("SELECT * FROM DRS.drivers WHERE DriverEmail = ?", [PurchaseDriver], (err, driverResults) => {
            if (err) reject(err);
            else resolve(driverResults);
          });
        });

        if (driverResults.length === 0) {
          return response.status(400).json({ error: 'Driver does not exist' });
        }

        updates.push("PurchaseDriver = ?");
        values.push(PurchaseDriver);
      } catch (error) {
        console.error("Database select error on drivers:", error);
        return response.status(500).json({ error: 'Database error' });
      }
    }

    if (PurchaseDate) {
      updates.push("PurchaseDate = ?");
      values.push(PurchaseDate);
    }

    if (PurchaseStatus) {
      updates.push("PurchaseStatus = ?");
      values.push(PurchaseStatus);
    }

    if (PurchaseSponsorID) {
      updates.push("PurchaseSponsorID = ?");
      values.push(PurchaseSponsorID);
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

      db.query("SELECT * FROM DRS.purchases WHERE PurchaseID = ?", [PurchaseID], (selErr, selResults) => {
        if (selErr) {
          console.error("Database select error:", selErr);
          return response.status(500).json({ error: 'Database select error after update' });
        }

        return response.status(200).json({
          message: 'Purchase updated',
          PurchaseID: PurchaseID,
          details: selResults[0]
        });
      });
    });
  });
});

/*
 * delete a purchase
 */
app.delete("/purchase", (request, response) => {
  const { PurchaseID } = request.query;
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