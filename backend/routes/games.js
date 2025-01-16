const express = require("express");
const router = express.Router();

const games = {}; // In-memory storage for simplicity (use DB in production)

// Example handler for fetching all games
router.get("/", (req, res) => {
    res.status(200).json([
        { id: 1, name: "Game 1", moves: [] },
        { id: 2, name: "Game 2", moves: [] },
    ]);
});
// Save a game
router.post("/save", (req, res) => {
    console.log("Request body received:", req.body);

    const { gameId, moves } = req.body;

    if (!gameId || !Array.isArray(moves)) {
        console.error("Invalid request: gameId or moves missing/invalid");
        return res.status(400).json({ error: "Invalid request. gameId and moves are required." });
    }

    games[gameId] = moves;
    console.log("Game saved:", { gameId, moves });

    res.status(200).send("Game saved successfully");
});

// Fetch a game
router.get("/:gameId", (req, res) => {
    const { gameId } = req.params;
    res.status(200).json(games[gameId] || []);
});

module.exports = router;

