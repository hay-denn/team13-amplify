import express from "express";
import serverlessExpress from "@vendia/serverless-express";
import mysql from "mysql2/promise";
import cors from "cors";
import axios from "axios";

const app = express();  
app.use(cors({ origin: "*" }));
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_URL,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: "DRS",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get("/status", (req, res) => {
  res.send({ Status: "Running" });
});

app.post("/purchase", async (req, res) => {
  const { PurchaseDriver, PurchaseDate, PurchaseStatus, PurchaseSponsorID, PurchasePrice } = req.body;

  if (!PurchaseDriver || !PurchaseDate || !PurchaseStatus || !PurchaseSponsorID || !PurchasePrice) {
    return res.status(400).json({
      error: 'PurchaseDriver, PurchaseDate, PurchaseStatus, PurchaseSponsorID, and PurchasePrice are required',
    });
  }

  try {
    const [insertResults] = await db.query(
      `INSERT INTO DRS.purchases (PurchaseDriver, PurchaseDate, PurchaseStatus, PurchaseSponsorID, PurchasePrice)
       VALUES (?, ?, ?, ?, ?)`,
      [PurchaseDriver, PurchaseDate, PurchaseStatus, PurchaseSponsorID, PurchasePrice]
    );

    res.status(201).json({
      message: 'Purchase created',
      PurchaseID: insertResults.insertId,
      details: { PurchaseDriver, PurchaseDate, PurchaseStatus, PurchasePrice }
    });
  } catch (err) {
    console.error("Database insert error on purchases:", err);
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Driver or Sponsor does not exist' });
    }
    res.status(500).json({ error: 'Database insert error' });
  }
});

app.get("/purchase", async (req, res) => {
  const { PurchaseID } = req.query;

  if (!PurchaseID) {
    return res.status(400).json({ error: 'PurchaseID required' });
  }

  try {
    const [results] = await db.query(`SELECT 
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
    GROUP BY p.PurchaseID;`, [PurchaseID]);

    if (results.length === 0) {
      return res.status(400).json({ error: 'Purchase not found' });
    }

    res.send(results[0]);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get("/purchasePrice", async (req, res) => {
  const { PurchaseID } = req.query;

  if (!PurchaseID) {
    return res.status(400).json({ error: 'PurchaseID required' });
  }

  try {
    const [results] = await db.query(
      `SELECT ProductPurchasedID FROM DRS.productspurchased WHERE PurchaseAssociatedID = ?`,
      [PurchaseID]
    );

    if (results.length === 0) {
      return res.status(400).json({ error: 'No products found for this PurchaseID' });
    }

    const productsPurchased = results.map(row => row.ProductPurchasedID);

    const itunesResponses = await Promise.all(
      productsPurchased.map(async (id) => {
        const url = `https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}`;
        try {
          const res = await axios.get(url);
          return res.data;
        } catch (error) {
          console.error(`Error fetching iTunes data for ID ${id}:`, error.message);
          return null;
        }
      })
    );

    const validResponses = itunesResponses
      .filter(res => res && res.resultCount > 0)
      .map(res => res.results[0]);

    let totalPrice = 0.0;

    for (const item of validResponses) {
      if (item.trackPrice != null) {
        totalPrice += item.trackPrice;
      } else if (item.collectionPrice != null) {
        totalPrice += item.collectionPrice;
      }
    }

    res.status(200).json({
      totalPrice,
      productsPurchased
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

app.get("/purchases", async (req, res) => {
  const { PurchaseDriver, PurchaseSponsorID } = req.query;
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

  try {
    const [results] = await db.query(query, params);
    res.send(results);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put("/purchase", async (req, res) => {
  const { PurchaseID, PurchaseDriver, PurchaseDate, PurchaseStatus, PurchaseSponsorID } = req.body;

  if (!PurchaseID) {
    return res.status(400).json({ error: 'PurchaseID required' });
  }

  try {
    const [existing] = await db.query("SELECT * FROM DRS.purchases WHERE PurchaseID = ?", [PurchaseID]);

    if (existing.length === 0) {
      return res.status(400).json({ error: 'Purchase not found' });
    }

    const updates = [];
    const values = [];

    if (PurchaseDriver) {
      const [driverResults] = await db.query("SELECT * FROM DRS.drivers WHERE DriverEmail = ?", [PurchaseDriver]);
      if (driverResults.length === 0) {
        return res.status(400).json({ error: 'Driver does not exist' });
      }
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

    if (PurchaseSponsorID) {
      updates.push("PurchaseSponsorID = ?");
      values.push(PurchaseSponsorID);
    }

    if (updates.length === 0) {
      return res.json({ message: 'No changes provided' });
    }

    const updateQuery = `UPDATE DRS.purchases SET ${updates.join(", ")} WHERE PurchaseID = ?`;
    values.push(PurchaseID);

    await db.query(updateQuery, values);

    const [selResults] = await db.query("SELECT * FROM DRS.purchases WHERE PurchaseID = ?", [PurchaseID]);

    res.status(200).json({
      message: 'Purchase updated',
      PurchaseID,
      details: selResults[0]
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: 'Database update error' });
  }
});

app.delete("/purchase", async (req, res) => {
  const { PurchaseID } = req.query;

  if (!PurchaseID) {
    return res.status(400).json({ error: 'PurchaseID required' });
  }

  try {
    const [results] = await db.query("SELECT * FROM DRS.purchases WHERE PurchaseID = ?", [PurchaseID]);

    if (results.length === 0) {
      return res.status(400).json({ error: 'Purchase not found' });
    }

    await db.query("DELETE FROM DRS.purchases WHERE PurchaseID = ?", [PurchaseID]);

    res.send({ message: 'Purchase deleted', user: results[0] });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: 'Database delete error' });
  }
});

app.get("/purchase_count", async (req, res) => {
  try {
    const [results] = await db.query("SELECT COUNT(*) AS count FROM DRS.purchases");
    res.send({ count: results[0].count });
  } catch (err) {
    console.error("Count error:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

export const handler = serverlessExpress({ app });