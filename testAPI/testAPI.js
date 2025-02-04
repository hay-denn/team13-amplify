const express = require('express');
const app = express();
const PORT = 3000;
const db = require('./db'); 

app.use(express.json())
var userArray = [];
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
  const { name, email, acc_type } = request.body;

  if (!name || !email || !acc_type) {
    return response.status(400).json({
      error: 'Name, email, and acc_type (account type) are required',
      account_types: user_types
    });
  }

  if (!user_types.includes(acc_type)) {
    return response.status(400).json({
      error: 'account type not valid',
      account_types: user_types
    });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length > 0) {
      return response.status(400).json({ error: 'user already exists' });
    }

    db.query(
      "INSERT INTO users (name, email, acc_type) VALUES (?, ?, ?)",
      [name, email, acc_type],
      (err, insertResults) => {
        if (err) {
          console.error("Database insert error:", err);
          return response.status(500).json({ error: 'Database insert error' });
        }

        response.status(201).json({
          message: 'User created',
          user: { name, email, acc_type }
        });
      }
    );
  });
});

/*
 * get specific user
 */
app.get("/user", (request, response) => {
  const { email } = request.body;

  if (!email) {
    return response.status(400).json({ error: 'email required' });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
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
  const { acc_type } = request.query;

  if (acc_type) {
    if (!user_types.includes(acc_type)) {
      return response.status(400).json({
        error: "account type not valid",
        account_types: user_types,
      });
    }

    db.query(
      "SELECT * FROM users WHERE acc_type = ?",
      [acc_type],
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
  const { email, name, acc_type } = request.body;

  if (!email) {
    return response.status(400).json({ error: 'email required' });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'user not found' });
    }

    const updates = [];
    const values = [];

    if (name) {
      updates.push("name = ?");
      values.push(name);
    }

    if (acc_type) {
      if (!user_types.includes(acc_type)) {
        return response.status(400).json({
          error: 'account type not valid',
          account_types: user_types
        });
      }
      updates.push("acc_type = ?");
      values.push(acc_type);
    }

    if (updates.length === 0) {
      return response.json({ message: 'No changes provided' });
    }

    const updateQuery = `UPDATE users SET ${updates.join(", ")} WHERE email = ?`;
    values.push(email); 

    db.query(updateQuery, values, (updateErr, updateResults) => {
      if (updateErr) {
        console.error("Database update error:", updateErr);
        return response.status(500).json({ error: 'Database update error' });
      }

      db.query("SELECT * FROM users WHERE email = ?", [email], (selErr, selResults) => {
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
  const { email } = request.body;
  if (!email) {
    return response.status(400).json({ error: 'email required' });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Database select error:", err);
      return response.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return response.status(400).json({ error: 'user not found' });
    }

    const userToDelete = results[0];

    db.query("DELETE FROM users WHERE email = ?", [email], (deleteErr, deleteResults) => {
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
  const { acc_type } = request.query;

  if (acc_type) {
    if (!user_types.includes(acc_type)) {
      return response.status(400).json({
        error: "account type not valid",
        account_types: user_types
      });
    }

    db.query(
      "SELECT COUNT(*) AS count FROM users WHERE acc_type = ?",
      [acc_type],
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

