const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Routes
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require('./routes/userRoutes')

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err.message);
    process.exit(1);
  });

app.use(cors());
app.use(express.json());

// API Routes - Must come BEFORE static files
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Serve static files from frontend build (if available)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// SPA Fallback - serve index.html for all non-API routes
app.use((req, res, next) => {
  // If the request path doesn't start with /api and it's a GET request
  if (!req.path.startsWith('/api') && req.method === 'GET') {
    const indexPath = path.join(__dirname, '../frontend/dist/index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        // If file not found, it might be development mode
        res.status(404).json({ success: false, message: "Frontend dist folder not found. Run 'npm run build' in frontend folder." });
      }
    });
  } else if (req.path.startsWith('/api')) {
    // API route not found
    res.status(404).json({ success: false, message: "API route not found" });
  } else {
    next();
  }
});

module.exports = app;
