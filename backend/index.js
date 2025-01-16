const express = require("express");
const app = express();
const userRoutes = require("./routes/users");
const gameRoutes = require("./routes/games");
const cors = require("cors");

// Middleware to parse JSON
app.use(cors({
    origin: "http://localhost:3000", // Update to deployed frontend URL after deployment
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
}));
app.use(express.json());

// Use the route files
app.use("/users", userRoutes);
app.use("/games", gameRoutes);

// Default route
app.get("/", (req, res) => {
    res.send("Chess app backend is running!");
});

// Use process.env.PORT for deployment and fallback to 5001 locally
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
