import express from "express";
import serverlessExpress from "@vendia/serverless-express";
import mysql from "mysql2";
import cors from "cors";

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

app.get("/status", (request, response) => {
	const status = {
		"Status": "Running"
	};
	response.send(status);
});

/*
 *  Add product purchased
 */
app.post("/productpurchased", (request, response) => {
  const {ProductPurchasedID, PurchaseAssociatedID, ProductPurchaseQuantity} = request.body;

  if (!ProductPurchasedID || !PurchaseAssociatedID || !ProductPurchaseQuantity) {
    return response.status(400).json({
      error: 'ProductPurchasedID, PurchaseAssociatedID, and ProductPurchaseQuantity are required'
    });
  }

  db.query("SELECT * FROM DRS.productspurchased WHERE ProductPurchasedID = ? AND PurchaseAssociatedID = ?", [ProductPurchasedID, PurchaseAssociatedID], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      return response.status(400).json({ error: 'Purchase already has that product' });
    }

    db.query(
      "INSERT INTO DRS.productspurchased (ProductPurchasedID, PurchaseAssociatedID, ProductPurchaseQuantity) VALUES (?, ?, ?)",
      [ProductPurchasedID, PurchaseAssociatedID, ProductPurchaseQuantity],
      (err, insertResults) => {
        if (err) {
          console.error("Database insert error:", err);
          return response.status(500).json({ error: 'Database insert error' });
        }

        response.status(201).json({
          message: 'Product purchased added',
          user: { ProductPurchasedID, PurchaseAssociatedID, ProductPurchaseQuantity }
        });
      }
    );
  });
});

/*
 * get specific product purchased
 */
app.get("/productpurchased", (request, response) => {
  const { ProductPurchasedID, PurchaseAssociatedID } = request.query;

  if (!ProductPurchasedID || !PurchaseAssociatedID) {
    return response.status(400).json({ error: 'ProductPurchasedID and PurchaseAssociatedID required' });
  }

  db.query("SELECT * FROM DRS.productspurchased WHERE ProductPurchasedID = ? AND PurchaseAssociatedID = ?", [ProductPurchasedID, PurchaseAssociatedID], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Product purchased not found' });
    }

    return response.send(results[0]);
  });
});

/*
 * get all products purchased
 */
app.get("/productspurchased", (request, response) => {
  const { ProductPurchasedID, PurchaseAssociatedID } = request.query;
  
  if(PurchaseAssociatedID){
    db.query("SELECT * FROM DRS.productspurchased WHERE PurchaseAssociatedID = ?", [PurchaseAssociatedID], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return response.status(500).json({ error: 'Database error' });
      }
  
      if (results.length === 0) {
        return response.status(400).json({ error: 'No products associated with order' });
      }
  
      return response.send(results);
    });
  }

  else if(ProductPurchasedID){
    db.query("SELECT * FROM DRS.productspurchased WHERE ProductPurchasedID = ?", [ProductPurchasedID], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return response.status(500).json({ error: 'Database error' });
      }
  
      if (results.length === 0) {
        return response.status(400).json({ error: 'Product has not been purchased' });
      }
  
      return response.send(results);
    });
  }

  else{
    db.query(
      "SELECT * FROM DRS.productspurchased",
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return response.status(500).json({ error: "Database error" });
        }
      return response.send(results);
    })
  }
});


/*
 * update quanity
 */
app.put("/productpurchased", (request, response) => {
  const {ProductPurchasedID, PurchaseAssociatedID, ProductPurchaseQuantity} = request.body;

  if (!ProductPurchasedID || !PurchaseAssociatedID || !ProductPurchaseQuantity) {
    return response.status(400).json({ error: 'ProductPurchasedID, PurchaseAssociatedID, and ProductPurchaseQuantity are required' });
  }

  db.query("SELECT * FROM DRS.productspurchased WHERE ProductPurchasedID = ? AND PurchaseAssociatedID = ?", [ProductPurchasedID, PurchaseAssociatedID], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Product purchased not found' });
    }

    const updates = ["ProductPurchaseQuantity = ?"];
    const values = [ProductPurchaseQuantity];

    const updateQuery = `UPDATE DRS.productspurchased SET ${updates.join(", ")} WHERE ProductPurchasedID = ? AND PurchaseAssociatedID = ?`
    values.push(ProductPurchasedID, PurchaseAssociatedID);

    db.query(updateQuery, values, (updateErr, updateResults) => {
      if (updateErr) {
        console.error("Database update error:", updateErr);
        return response.status(500).json({ error: 'Database update error' });
      }

      db.query("SELECT * FROM DRS.productspurchased WHERE ProductPurchasedID = ? AND PurchaseAssociatedID = ?", [ProductPurchasedID, PurchaseAssociatedID], (selErr, selResults) => {
        if (selErr) {
          console.error("Database select error:", selErr);
          return response.status(500).json({ error: 'Database select error after update' });
        }

        return response.status(201).json({
          message: 'Quantity updated',
          user: selResults[0]
        });
      });
    });
  });
});

/*
 * delete an product purchased
 */
app.delete("/productpurchased", (request, response) => {
  const { ProductPurchasedID, PurchaseAssociatedID } = request.query;

  if (!ProductPurchasedID || !PurchaseAssociatedID) {
    return response.status(400).json({ error: 'ProductPurchasedID and PurchaseAssociatedID required' });
  }

  db.query("SELECT * FROM DRS.productspurchased WHERE ProductPurchasedID = ? AND PurchaseAssociatedID = ?", [ProductPurchasedID, PurchaseAssociatedID], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Product purchased not found' });
    }

    const userToDelete = results[0];

    db.query("DELETE FROM DRS.productspurchased WHERE ProductPurchasedID = ? AND PurchaseAssociatedID = ?", [ProductPurchasedID, PurchaseAssociatedID], (deleteErr, deleteResults) => {
      if (deleteErr) {
        console.error("Database delete error:", deleteErr);
        return response.status(500).json({ error: 'Database delete error' });
      }

      return response.send({
        message: 'Product purchase deleted',
        user: userToDelete
      });
    });
  });
});

/*
 * get purchase count
 */
app.get("/productspurchased_count", (request, response) => {

    db.query(
      "SELECT COUNT(*) AS count FROM DRS.productspurchased",
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