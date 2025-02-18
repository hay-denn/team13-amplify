const express = require('express');
const app = express();
const PORT = 4000;
const db = require('./db'); // Assuming db.js handles database connections
const cors = require("cors");

app.use(cors({ origin: "*" }));
app.use(express.json());

const user_types = ["driver", "sponsor", "admin"];

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
});

app.get("/status", (request, response) => {
    const status = { "Status": "Running" };
    response.send(status);
});

/*
 * Add about information to the about database (ALL team members are required)
 */
app.post("/about", async (request, response) => {
    try {
        const { sprint_num, team_member1, team_member2, team_member3, team_member4, team_member5 } = request.body;

        if (!sprint_num || !team_member1 || !team_member2 || !team_member3 || !team_member4 || !team_member5) {
            return response.status(400).json({ error: "Sprint number and all five team members are required" });
        }

        const query = `
            INSERT INTO about (sprint_num, team_member1, team_member2, team_member3, team_member4, team_member5)
            VALUES (?, ?, ?, ?, ?, ?);
        `;

        const [result] = await db.execute(query, [sprint_num, team_member1, team_member2, team_member3, team_member4, team_member5]);

        // ✅ Ensure result is not undefined
        if (!result || !result.insertId) {
            return response.status(500).json({ error: "Failed to insert data" });
        }

        response.status(201).json({
            message: "About information added",
            entry: {
                id: result.insertId,
                sprint_num,
                team_member1,
                team_member2,
                team_member3,
                team_member4,
                team_member5
            }
        });
    } catch (error) {
        console.error("Database insert error:", error);
        response.status(500).json({ error: "Internal server error" });
    }
});


/*
 * Get all about information
 */
app.get("/about", async (request, response) => {
    try {
        const result = await db.query("SELECT * FROM about;");
        response.json(result[0]);
    } catch (error) {
        console.error("Database query error:", error);
        response.status(500).json({ error: "Internal server error" });
    }
});

/*
 * Update about information (ALL team members are required)
 */
app.put("/about/:id", async (request, response) => {
    try {
        const { id } = request.params;
        const { sprint_num, team_member1, team_member2, team_member3, team_member4, team_member5 } = request.body;

        if (!sprint_num || !team_member1 || !team_member2 || !team_member3 || !team_member4 || !team_member5) {
            return response.status(400).json({ error: "Sprint number and all five team members are required" });
        }

        const query = `
            UPDATE about
            SET sprint_num = ?, team_member1 = ?, team_member2 = ?, team_member3 = ?, team_member4 = ?, team_member5 = ?
            WHERE id = ?;
        `;

        const [result] = await db.execute(query, [sprint_num, team_member1, team_member2, team_member3, team_member4, team_member5, id]);

        if (result.affectedRows === 0) {
            return response.status(404).json({ error: "Record not found" });
        }

        // Since MySQL does not support RETURNING *, fetch the updated row manually
        const [updatedRows] = await db.execute("SELECT * FROM about WHERE id = ?;", [id]);

        return response.json({ message: "About information updated", entry: updatedRows[0] });
    } catch (error) {
        console.error("Database update error:", error);
        return response.status(500).json({ error: "Internal server error" });
    }
});


/*
 * Delete about information
 */
app.delete("/about/:id", async (request, response) => {
    try {
        const { id } = request.params;

        // Fetch the row before deleting it
        const [existingRows] = await db.execute("SELECT * FROM about WHERE id = ?;", [id]);

        if (existingRows.length === 0) {
            return response.status(404).json({ error: "Record not found" });
        }

        const query = `DELETE FROM about WHERE id = ?;`;
        const [result] = await db.execute(query, [id]);

        if (result.affectedRows === 0) {
            return response.status(404).json({ error: "Record not found" });
        }

        return response.json({ message: "About information deleted", deletedEntry: existingRows[0] });
    } catch (error) {
        console.error("Database delete error:", error);
        return response.status(500).json({ error: "Internal server error" });
    }
});

