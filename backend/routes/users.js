const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:1995@localhost:5050/chess_app",
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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
