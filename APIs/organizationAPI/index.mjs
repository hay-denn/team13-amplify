import express from "express";
import serverlessExpress from "@vendia/serverless-express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// not sure why but env vars aren't working
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
    Status: "Running"
  };
  response.send(status);
});

/*
 * Add organization (POST)
 */
app.post("/organization", (request, response) => {
  const {
    OrganizationName,
    OrganizationDescription,
    SearchTerm,
    PointDollarRatio,
    AmountOfProducts,
    ProductType,
    MaxPrice,
    HideDescription = false,
    LogoUrl = null,
    WebsiteUrl = null,
    HideWebsiteUrl = false
  } = request.body;

  if (!OrganizationName) {
    return response.status(400).json({
      error: "OrganizationName is required",
    });
  }

  db.query(
    "SELECT * FROM DRS.sponsororganizations WHERE OrganizationName = ?",
    [OrganizationName],
    (err, results) => {
      if (err) {
        console.error("Database select error:", err);
        return response.status(500).json({ error: "Database error" });
      }

      if (results.length > 0) {
        return response
          .status(400)
          .json({ error: "Organization already exists" });
      }

      db.query(
        `INSERT INTO DRS.sponsororganizations
         (OrganizationName, OrganizationDescription, SearchTerm, PointDollarRatio,
          AmountOfProducts, ProductType, MaxPrice, HideDescription, LogoUrl,
          WebsiteUrl, HideWebsiteUrl)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          OrganizationName,
          OrganizationDescription,
          SearchTerm,
          PointDollarRatio,
          AmountOfProducts,
          ProductType,
          MaxPrice,
          HideDescription,
          LogoUrl,
          WebsiteUrl,
          HideWebsiteUrl
        ],
        (insertErr, insertResults) => {
          if (insertErr) {
            console.error("Database insert error:", insertErr);
            return response
              .status(500)
              .json({ error: "Database insert error" });
          }

          response.status(201).json({
            message: "Organization created",
            user: {
              OrganizationName,
              OrganizationDescription,
              PointDollarRatio,
              AmountOfProducts,
              ProductType,
              MaxPrice,
              HideDescription,
              LogoUrl,
              WebsiteUrl,
              HideWebsiteUrl
            }
          });
        }
      );
    }
  );
});

/*
 * Get specific organization (GET)
 */
app.get("/organization", (request, response) => {
  const { OrganizationID } = request.query;

  if (!OrganizationID) {
    return response.status(400).json({ error: "OrganizationID required" });
  }

  db.query(
    "SELECT * FROM DRS.sponsororganizations WHERE OrganizationID = ?",
    [OrganizationID],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return response.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return response
          .status(400)
          .json({ error: "Organization not found" });
      }

      return response.send(results[0]);
    }
  );
});

/*
 * Get all organizations (GET)
 */
app.get("/organizations", (request, response) => {
  db.query(
    "SELECT * FROM DRS.sponsororganizations",
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return response
          .status(500)
          .json({ error: "Database error" });
      }
      return response.send(results);
    }
  );
});

/*
 * Update organization (PUT)
 */
app.put("/organization", (request, response) => {
  const {
    OrganizationID,
    OrganizationName,
    OrganizationDescription,
    SearchTerm,
    PointDollarRatio,
    AmountOfProducts,
    ProductType,
    MaxPrice,
    HideDescription,
    LogoUrl,
    WebsiteUrl,
    HideWebsiteUrl
  } = request.body;

  if (!OrganizationID) {
    return response.status(400).json({ error: "OrganizationID required" });
  }

  // First, fetch existing organization details
  db.query(
    "SELECT * FROM DRS.sponsororganizations WHERE OrganizationID = ?",
    [OrganizationID],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return response.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return response
          .status(400)
          .json({ error: "Organization not found" });
      }

      const existingOrg = results[0];

      // Use provided values if they exist, else keep existing
      const updatedOrganizationName =
        OrganizationName || existingOrg.OrganizationName;
      const updatedOrganizationDescription =
        OrganizationDescription || existingOrg.OrganizationDescription;
      const updatedSearchTerm =
        SearchTerm || existingOrg.SearchTerm;
      const updatedPointDollarRatio =
        PointDollarRatio ?? existingOrg.PointDollarRatio;
      const updatedAmountOfProducts =
        AmountOfProducts ?? existingOrg.AmountOfProducts;
      const updatedProductType =
        ProductType || existingOrg.ProductType;
      const updatedMaxPrice =
        MaxPrice ?? existingOrg.MaxPrice;
      const updatedHideDescription =
        HideDescription ?? existingOrg.HideDescription;
      const updatedLogoUrl =
        LogoUrl ?? existingOrg.LogoUrl;
      const updatedWebsiteUrl =
        WebsiteUrl ?? existingOrg.WebsiteUrl;     // NEW
      const updatedHideWebsiteUrl =
        HideWebsiteUrl ?? existingOrg.HideWebsiteUrl; // NEW

      // Build the update query
      const updateQuery = `
        UPDATE DRS.sponsororganizations
        SET OrganizationName = ?,
            OrganizationDescription = ?,
            SearchTerm = ?,
            PointDollarRatio = ?,
            AmountOfProducts = ?,
            ProductType = ?,
            MaxPrice = ?,
            HideDescription = ?,
            LogoUrl = ?,
            WebsiteUrl = ?,
            HideWebsiteUrl = ?
        WHERE OrganizationID = ?`;

      const values = [
        updatedOrganizationName,
        updatedOrganizationDescription,
        updatedSearchTerm,
        updatedPointDollarRatio,
        updatedAmountOfProducts,
        updatedProductType,
        updatedMaxPrice,
        updatedHideDescription,
        updatedLogoUrl,
        updatedWebsiteUrl,
        updatedHideWebsiteUrl,
        OrganizationID
      ];

      db.query(updateQuery, values, (updateErr) => {
        if (updateErr) {
          console.error("Database update error:", updateErr);
          return response.status(500).json({
            error: "Database update error",
            UpdateError: updateErr.sqlMessage
          });
        }

        // Fetch the updated record to return in the response
        db.query(
          "SELECT * FROM DRS.sponsororganizations WHERE OrganizationID = ?",
          [OrganizationID],
          (selErr, selResults) => {
            if (selErr) {
              console.error("Database select error after update:", selErr);
              return response
                .status(500)
                .json({ error: "Database select error after update" });
            }

            return response.status(200).json({
              message: "Organization updated successfully",
              organization: selResults[0],
            });
          }
        );
      });
    }
  );
});

/*
 * Delete organization (DELETE)
 */
app.delete("/organization", (request, response) => {
  const { OrganizationID } = request.query;

  if (!OrganizationID) {
    return response.status(400).json({ error: "OrganizationID required" });
  }

  db.query(
    "SELECT * FROM DRS.sponsororganizations WHERE OrganizationID = ?",
    [OrganizationID],
    (err, results) => {
      if (err) {
        console.error("Database select error:", err);
        return response.status(500).json({ error: "Database error" });
      }

      if (results.length === 0) {
        return response
          .status(400)
          .json({ error: "Organization not found" });
      }

      const orgToDelete = results[0];

      db.query(
        "DELETE FROM DRS.sponsororganizations WHERE OrganizationID = ?",
        [OrganizationID],
        (deleteErr) => {
          if (deleteErr) {
            console.error("Database delete error:", deleteErr);
            return response
              .status(500)
              .json({ error: "Database delete error" });
          }

          return response.send({
            message: "Organization deleted",
            organization: orgToDelete
          });
        }
      );
    }
  );
});

/*
 * Get organization count (GET)
 */
app.get("/organization_count", (request, response) => {
  db.query(
    "SELECT COUNT(*) AS count FROM DRS.sponsororganizations",
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return response.status(500).json({ error: "Database error" });
      }
      return response.send({ count: results[0].count });
    }
  );
});

/*
 * add daily points
 */
app.put("/dailypoints", (request, response) => {
  const { OrganizationID, DailyPointChange } = request.body;

  if ( !OrganizationID || DailyPointChange === undefined) {
    return response.status(400).json({
      error: "OrganizationID and DailyPointChange are required"
    });
  }

  const updateQuery = `
    UPDATE DRS.sponsororganizations 
    SET DailyPointChange = ? 
    WHERE OrganizationID = ?
  `;

  db.query(
    updateQuery,
    [DailyPointChange, OrganizationID],
    (err, results) => {
      if (err) {
        console.error("Database update error:", err);
        return response.status(500).json({ error: "Database update error" });
      }

      // Check if any rows were actually updated.
      if (results.affectedRows === 0) {
        return response.status(400).json({
          error: "No matching relationship found to update"
        });
      }

      return response.status(200).json({
        message: "DailyPoints updated successfully",
        affectedRows: results.affectedRows
      });
    }
  );
});

/*
 * get daily points
 */
app.get("/dailypoints", (request, response) => {
  const { OrganizationID } = request.query;

  if ( !OrganizationID ) {
    return response
      .status(400)
      .json({ error: "OrganizationID is required" });
  }

  const selectQuery = `
    SELECT DailyPointChange 
    FROM DRS.sponsororganizations 
    WHERE OrganizationID = ?
  `;

  db.query(selectQuery, [OrganizationID], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return response.status(500).json({ error: "Database query error" });
    }
    if (results.length === 0) {
      return response
        .status(404)
        .json({ error: "No matching relationship found" });
    }
    return response.status(200).json(results[0]);
  });
});

export const handler = serverlessExpress({ app });
