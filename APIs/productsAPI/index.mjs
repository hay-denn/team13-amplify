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
 *  Add product
 */
app.post("/product", (request, response) => {
  const {ProductName, ProductDescription, ProductPrice, ProductInventory} = request.body;

  if (!ProductName || !ProductPrice) {
    return response.status(400).json({
      error: 'ProductName and ProductPrice are required',
    });
  }

  db.query("SELECT * FROM DRS.product WHERE ProductName = ?", [ProductName], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      return response.status(400).json({ error: 'Product already exists' });
    }

    const fields = [];
    const values = [];
    const placeholders = [];

    if (ProductName) {
      fields.push("ProductName");
      values.push(ProductName);
      placeholders.push("?");
    }

    if (ProductDescription) {
      fields.push("ProductDescription");
      values.push(ProductDescription);
      placeholders.push("?");
    }

    if (ProductPrice) {
      fields.push("ProductPrice");
      values.push(ProductPrice);
      placeholders.push("?");
    }

    if (ProductInventory) {
      fields.push("ProductInventory");
      values.push(ProductInventory);
      placeholders.push("?");
    }

    const postQuery = `INSERT INTO DRS.product (${fields.join(", ")}) values (${placeholders.join(", ")})`;

    db.query(postQuery, values, (updateErr, updateResults) => {
      if (updateErr) {
        console.error("Database update error:", updateErr);
        return response.status(500).json({ error: "Database insertion error" });
      }

      db.query("SELECT * FROM DRS.product WHERE ProductName = ?", [ProductName], (selErr, selResults) => {
        if (selErr) {
          console.error("Database select error:", selErr);
          return response.status(500).json({ error: 'Database select error after insertion' });
        }

        return response.json({
          message: 'Product added',
          user: selResults[0]
        });
      });
    });
  });
});

/*
 * get specific product
 */
app.get("/product", (request, response) => {
  const { ProductID } = request.query;

  if (!ProductID) {
    return response.status(400).json({ error: 'ProductID required' });
  }

  db.query("SELECT * FROM DRS.product WHERE ProductID = ?", [ProductID], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Product not found' });
    }

    return response.send(results[0]);
  });
});

/*
 * get all products by catalog
 */
app.get("/products", (request, response) => {

  db.query(
    "SELECT * FROM DRS.product",
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return response.status(500).json({ error: "Database error" });
      }
    return response.send(results);
  })
  
});

/*
 * update product
 */
app.put("/product", (request, response) => {
  const {ProductID, ProductName, ProductDescription, ProductPrice, ProductInventory} = request.body;

  if (!ProductID) {
    return response.status(400).json({ error: 'ProductID required' });
  }

  db.query("SELECT * FROM DRS.product WHERE ProductID = ?", [ProductID], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Product not found' });
    }

    const updates = [];
    const values = [];

    if (ProductName) {
      updates.push("ProductName = ?");
      values.push(ProductName);
    }

    if (ProductDescription) {
      updates.push("ProductDescription = ?");
      values.push(ProductDescription);
    }

    if (ProductPrice) {
      updates.push("ProductPrice = ?");
      values.push(ProductPrice);
    }

    if (ProductInventory) {
      updates.push("ProductInventory = ?");
      values.push(ProductInventory);
    }

    const updateQuery = `UPDATE DRS.product SET ${updates.join(", ")} WHERE ProductID = ?`
    values.push(ProductID);

    db.query(updateQuery, values, (updateErr, updateResults) => {
      if (updateErr) {
        console.error("Database update error:", updateErr);
        return response.status(500).json({ error: 'Database update error' });
      }

      db.query("SELECT * FROM DRS.product WHERE ProductID = ?", [ProductID], (selErr, selResults) => {
        if (selErr) {
          console.error("Database select error:", selErr);
          return response.status(500).json({ error: 'Database select error after update' });
        }

        return response.status(201).json({
          message: 'Product updated',
          user: selResults[0]
        });
      });
    });
  });
});

/*
 * delete a product 
 */
app.delete("/product", (request, response) => {
  const { ProductID } = request.query;
  if (!ProductID) {
    return response.status(400).json({ error: 'ProductID required' });
  }

  db.query("SELECT * FROM DRS.product WHERE ProductID = ?", [ProductID], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'Product not found' });
    }

    const userToDelete = results[0];

    db.query("DELETE FROM DRS.product WHERE ProductID = ?", [ProductID], (deleteErr, deleteResults) => {
      if (deleteErr) {
        console.error("Database delete error:", deleteErr);
        return response.status(500).json({ error: 'Database delete error' });
      }

      return response.send({
        message: 'Product deleted',
        user: userToDelete
      });
    });
  });
});

/*
 * get product count
 */
app.get("/product_count", (request, response) => {

    db.query(
      "SELECT COUNT(*) AS count FROM DRS.product",
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