const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

// Database connection
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "chess_app",
    password: "1995",
    port: 5050,
});

// Get all users
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Add other user routes here

module.exports = router;
