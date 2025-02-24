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
 *  Add amin
 */
app.post("/sponsor", (request, response) => {
  const { UserEmail, UserFName, UserLName, UserOrganization} = request.body;

  const UserType = "User";

  if (!UserEmail || !UserFName || !UserLName || !UserOrganization) {
    return response.status(400).json({
      error: 'UserFName, UserLName, UserEmail, and UserOrganization are required',
    });
  }

  db.query("SELECT * FROM sponsorusers WHERE UserEmail = ?", [UserEmail], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      return response.status(400).json({ error: 'user already exists' });
    }

    db.query(
      "INSERT INTO sponsorusers (UserFName, UserLName, \
	  						UserEmail, UserOrganization) \
	  VALUES (?, ?, ?, ?)",
      [UserFName, UserLName, UserEmail, UserOrganization],
      (err, insertResults) => {
        if (err) {
          console.error("Database insert error:", err);
          return response.status(500).json({ error: 'Database insert error' });
        }

        response.status(201).json({
          message: 'User created',
          user: { UserFName, UserLName, UserEmail, UserOrganization }
        });
      }
    );
  });
});

/*
 * get specific user
 */
app.get("/sponsor", (request, response) => {
  const { UserEmail } = request.query;

  if (!UserEmail) {
    return response.status(400).json({ error: 'UserEmail required' });
  }

  db.query("SELECT * FROM sponsorusers WHERE UserEmail = ?", [UserEmail], (err, results) => {
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
 * get all users
 */
app.get("/sponsors", (request, response) => {

  db.query(
    "SELECT * FROM sponsorusers",
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return response.status(500).json({ error: "Database error" });
      }
      return response.send(results);
    })

});


/*
 * update user
 */
app.put("/sponsor", (request, response) => {
  const { UserEmail, UserFName, UserLName, UserOrganization} = request.body;

  if (!UserEmail) {
    return response.status(400).json({ error: 'UserEmail required' });
  }

  db.query("SELECT * FROM sponsorusers WHERE UserEmail = ?", [UserEmail], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'user not found' });
    }

    const updates = [];
    const values = [];

    if (UserFName) {
      updates.push("UserFName = ?");
      values.push(UserFName);
    }

    if (UserLName) {
      updates.push("UserLName = ?");
      values.push(UserLName);
    }

	if (UserOrganization) {
	  updates.push("UserOrganization = ?");
	  values.push(UserOrganization);
	}
  
    if (updates.length === 0) {
      return response.json({ message: 'No changes provided' });
    }

    const updateQuery = `UPDATE sponsorusers SET ${updates.join(", ")} WHERE UserEmail = ?`;
    values.push(UserEmail); 

    db.query(updateQuery, values, (updateErr, updateResults) => {
      if (updateErr) {
        console.error("Database update error:", updateErr);
        return response.status(500).json({ error: 'Database update error' });
      }

      db.query("SELECT * FROM sponsorusers WHERE UserEmail = ?", [UserEmail], (selErr, selResults) => {
        if (selErr) {
          console.error("Database select error:", selErr);
          return response.status(500).json({ error: 'Database select error after update' });
        }

        return response.status(201).json({
          message: 'user updated',
          user: selResults[0]
        });
      });
    });
  });
});

/*
 * delete a user
 */
app.delete("/sponsor", (request, response) => {
  const { UserEmail } = request.query;
  if (!UserEmail) {
    return response.status(400).json({ error: 'UserEmail required' });
  }

  db.query("SELECT * FROM sponsorusers WHERE UserEmail = ?", [UserEmail], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'user not found' });
    }

    const userToDelete = results[0];

    db.query("DELETE FROM sponsorusers WHERE UserEmail = ?", [UserEmail], (deleteErr, deleteResults) => {
      if (deleteErr) {
        console.error("Database delete error:", deleteErr);
        return response.status(500).json({ error: 'Database delete error' });
      }

      return response.send({
        message: 'user deleted',
        user: userToDelete
      });
    });
  });
});

/*
 * get user count
 */
app.get("/sponsor_count", (request, response) => {

    db.query(
      "SELECT COUNT(*) AS count FROM sponsorusers",
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


