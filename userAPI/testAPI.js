const express = require('express');
const app = express();
const PORT = 3000;
const db = require('./db'); 

app.use(express.json())
const user_types = ["driver","sponsor","admin"]

app.listen(PORT, '0.0.0.0', () => {
	console.log('Server listening on port 3000');
});						  

app.get("/status", (request, response) => {
	const status = {
		"Status": "Running"
	};
	response.send(status);
});

/*
 *  Add user
 */
app.post("/user", (request, response) => {
  const { UserEmail, UserType, UserFName, UserLName} = request.body;

  if (!UserFName || !UserLName || !UserEmail || !UserType) {
    return response.status(400).json({
      error: 'UserFName, UserLName, UserEmail, and UserType (account type) are required',
      account_types: user_types
    });
  }

  if (!user_types.includes(UserType)) {
    return response.status(400).json({
      error: 'account type not valid',
      account_types: user_types
    });
  }

  db.query("SELECT * FROM users WHERE UserEmail = ?", [UserEmail], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      return response.status(400).json({ error: 'user already exists' });
    }

    db.query(
      "INSERT INTO users (UserFName, UserLName, UserEmail, UserType) VALUES (?, ?, ?, ?)",
      [UserFName, UserLName, UserEmail, UserType],
      (err, insertResults) => {
        if (err) {
          console.error("Database insert error:", err);
          return response.status(500).json({ error: 'Database insert error' });
        }

        response.status(201).json({
          message: 'User created',
          user: { UserFName, UserLName, UserEmail, UserType }
        });
      }
    );
  });
});

/*
 * get specific user
 */
app.get("/user", (request, response) => {
  const { UserEmail } = request.body;

  if (!UserEmail) {
    return response.status(400).json({ error: 'UserEmail required' });
  }

  db.query("SELECT * FROM users WHERE UserEmail = ?", [UserEmail], (err, results) => {
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
 * also get all users of a specific account type
 */
app.get("/users", (request, response) => {
  const { UserType } = request.query;

  if (UserType) {
    if (!user_types.includes(UserType)) {
      return response.status(400).json({
        error: "account type not valid",
        account_types: user_types,
      });
    }

    db.query(
      "SELECT * FROM users WHERE UserType = ?",
      [UserType],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return response.status(500).json({ error: "Database error" });
        }
        return response.send(results);
      }
    );
  } else {
    db.query("SELECT * FROM users", (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return response.status(500).json({ error: "Database error" });
      }
      return response.send(results);
    });
  }
});


/*
 * update user
 */
app.put("/user", (request, response) => {
  const { UserEmail, UserFName, UserLName, UserType } = request.body;

  if (!UserEmail) {
    return response.status(400).json({ error: 'UserEmail required' });
  }

  db.query("SELECT * FROM users WHERE UserEmail = ?", [UserEmail], (err, results) => {
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


    if (UserType) {
      if (!user_types.includes(UserType)) {
        return response.status(400).json({
          error: 'account type not valid',
          account_types: user_types
        });
      }
      updates.push("UserType = ?");
      values.push(UserType);
    }

    if (updates.length === 0) {
      return response.json({ message: 'No changes provided' });
    }

    const updateQuery = `UPDATE users SET ${updates.join(", ")} WHERE UserEmail = ?`;
    values.push(UserEmail); 

    db.query(updateQuery, values, (updateErr, updateResults) => {
      if (updateErr) {
        console.error("Database update error:", updateErr);
        return response.status(500).json({ error: 'Database update error' });
      }

      db.query("SELECT * FROM users WHERE UserEmail = ?", [UserEmail], (selErr, selResults) => {
        if (selErr) {
          console.error("Database select error:", selErr);
          return response.status(500).json({ error: 'Database select error after update' });
        }

        return response.json({
          message: 'User updated',
          user: selResults[0]
        });
      });
    });
  });
});

/*
 * delete a user
 */
app.delete("/user", (request, response) => {
  const { UserEmail } = request.body;
  if (!UserEmail) {
    return response.status(400).json({ error: 'UserEmail required' });
  }

  db.query("SELECT * FROM users WHERE UserEmail = ?", [UserEmail], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'user not found' });
    }

    const userToDelete = results[0];

    db.query("DELETE FROM users WHERE UserEmail = ?", [UserEmail], (deleteErr, deleteResults) => {
      if (deleteErr) {
        console.error("Database delete error:", deleteErr);
        return response.status(500).json({ error: 'Database delete error' });
      }

      return response.send({
        message: 'User deleted',
        user: userToDelete
      });
    });
  });
});

/*
 * get user count
 */
app.get("/user_count", (request, response) => {
  const { UserType } = request.query;

  if (UserType) {
    if (!user_types.includes(UserType)) {
      return response.status(400).json({
        error: "account type not valid",
        account_types: user_types
      });
    }

    db.query(
      "SELECT COUNT(*) AS count FROM users WHERE UserType = ?",
      [UserType],
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return response.status(500).json({ error: 'Database error' });
        }
        return response.send({ count: results[0].count });
      }
    );
  } else {
    db.query(
      "SELECT COUNT(*) AS count FROM users",
      (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return response.status(500).json({ error: 'Database error' });
        }
        return response.send({ count: results[0].count });
      }
    );
  }
});

