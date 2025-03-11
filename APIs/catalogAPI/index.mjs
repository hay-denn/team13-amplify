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

// Simple health check
app.get("/status", (req, res) => {
  res.send({ Status: "Running" });
});

/**
 * POST /catalog
 * Create a new catalog entry
 * Expects body: { CatalogID, CatalogOrganization }
 */
app.post("/catalog", (req, res) => {
  const { CatalogOrganization } = req.body;

  // Validate required fields
  if (CatalogOrganization == null) {
    return res.status(400).json({
      error: "CatalogID and CatalogOrganization are required",
    });
  }

	// Check if organization exists
	db.query("SELECT * FROM sponsororganizations WHERE OrganizationID = ?", [CatalogOrganization], (err, results) => {
		if (err) {
			console.error("Database error:", err);
			return res.status(500).json({ error: "Database error" });
		}
		if (results.length === 0) {
			return res.status(400).json({ error: "Organization not found" });
		}
	});

	// Insert new record
	db.query(
		"INSERT INTO catalog (CatalogOrganization) VALUES (?)",
		[CatalogOrganization],
		(insertErr) => {
			if (insertErr) {
				console.error("Database insert error:", insertErr);
				return res.status(500).json({ error: "Database insert error" });
			}
			return res.status(201).json({
				message: "Catalog created",
				catalog: { CatalogOrganization },
			});
		}
	);
});

/**
 * GET /catalog
 * Retrieve a single catalog entry by CatalogID
 * Expects query param: ?CatalogID=123
 */
app.get("/catalog", (req, res) => {
  const { CatalogID } = req.query;

  if (!CatalogID) {
    return res.status(400).json({ error: "CatalogID required" });
  }

  db.query("SELECT * FROM catalog WHERE CatalogID = ?", [CatalogID], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: "Catalog not found" });
    }

    return res.send(results[0]);
  });
});

/**
 * GET /catalogs
 * Retrieve all catalog entries
 */
app.get("/catalogs", (req, res) => {
  db.query("SELECT * FROM catalog", (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    return res.send(results);
  });
});

/**
 * PUT /catalog
 * Update an existing catalog entry by CatalogID
 * Expects body: { CatalogID, [CatalogOrganization] }
 */
app.put("/catalog", (req, res) => {
  const { CatalogID, CatalogOrganization } = req.body;

  // CatalogID is required to know which entry to update
  if (!CatalogID) {
    return res.status(400).json({ error: "CatalogID required" });
  }

  // Check if the catalog entry exists
  db.query("SELECT * FROM catalog WHERE CatalogID = ?", [CatalogID], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: "Catalog not found" });
    }

    // Build dynamic updates
    const updates = [];
    const values = [];

    if (CatalogOrganization != null) {
      updates.push("CatalogOrganization = ?");
      values.push(CatalogOrganization);
    }

    // If nothing to update, just return
    if (updates.length === 0) {
      return res.json({ message: "No changes provided" });
    }

		// check organization exists
		if (CatalogOrganization != null) {
			db.query("SELECT * FROM sponsororganizations WHERE OrganizationID = ?", [CatalogOrganization], (err, results) => {
				if (err) {
					console.error("Database error:", err);
					return res.status(500).json({ error: "Database error" });
				}
				if (results.length === 0) {
					return res.status(400).json({ error: "Organization not found" });
				}
			});
		}

    // Perform the update
    const updateQuery = `UPDATE catalog SET ${updates.join(", ")} WHERE CatalogID = ?`;
    values.push(CatalogID);

    db.query(updateQuery, values, (updateErr) => {
      if (updateErr) {
        console.error("Database update error:", updateErr);
        return res.status(500).json({ error: "Database update error" });
      }

      // Return the updated record
      db.query("SELECT * FROM catalog WHERE CatalogID = ?", [CatalogID], (selErr, selResults) => {
        if (selErr) {
          console.error("Database select error:", selErr);
          return res.status(500).json({ error: "Database select error after update" });
        }

        return res.status(200).json({
          message: "Catalog updated",
          catalog: selResults[0],
        });
      });
    });
  });
});

/**
 * DELETE /catalog
 * Delete a catalog entry by CatalogID
 * Expects query param: ?CatalogID=123
 */
app.delete("/catalog", (req, res) => {
  const { CatalogID } = req.query;

  if (!CatalogID) {
    return res.status(400).json({ error: "CatalogID required" });
  }

  // Check if catalog entry exists
  db.query("SELECT * FROM catalog WHERE CatalogID = ?", [CatalogID], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: "Catalog not found" });
    }

    const catalogToDelete = results[0];

    // Perform delete
    db.query("DELETE FROM catalog WHERE CatalogID = ?", [CatalogID], (deleteErr) => {
      if (deleteErr) {
        console.error("Database delete error:", deleteErr);
        return res.status(500).json({ error: "Database delete error" });
      }

      return res.send({
        message: "Catalog deleted",
        catalog: catalogToDelete,
      });
    });
  });
});

/**
 * GET /catalog_count
 * Return the total number of catalog entries
 */
app.get("/catalog_count", (req, res) => {
  db.query("SELECT COUNT(*) as count FROM catalog", (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    return res.send({ count: results[0].count });
  });
});

// Export the serverless handler
export const handler = serverlessExpress({ app });
