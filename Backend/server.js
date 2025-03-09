console.log("✅ Server is starting...");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Enable CORS to allow requests from frontend
app.use(cors());

// Sample announcements data
const announcements = [
    { id: 1, text: "New community health policy update." },
    { id: 2, text: "Community picnic scheduled this weekend." },
    { id: 3, text: "Road safety measures implemented." },
    { id: 4, text: "New bakery opening downtown." },
    { id: 5, text: "Neighborhood watch meeting on Tuesday." }
];

// 🔍 **GET /search endpoint** (Search functionality)
app.get("/search", (req, res) => {
    const query = req.query.query?.toLowerCase(); // Get search query from frontend

    if (!query) {
        return res.json([]); // If query is empty, return an empty array
    }

    // Filter announcements that contain the search query
    const filteredResults = announcements.filter(a => a.text.toLowerCase().includes(query));

    res.json(filteredResults); // Send filtered results back to the frontend
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
