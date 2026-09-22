require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { initDb } = require("./db");

const authRoutes = require("./routes/authRoutes");
const songRoutes = require("./routes/songRoutes");
const Song = require("./models/Song");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

// Virtual file serving from PostgreSQL for audio and cover images
app.get("/uploads/songs/:filename", async (req, res) => {
  try {
    const song = await Song.findOne({ fileUrl: "/uploads/songs/" + req.params.filename });
    if (!song || !song.audioData) {
      return res.status(404).send("Audio file not found in database.");
    }
    res.set("Content-Type", song.audioContentType || "audio/mpeg");
    res.send(song.audioData);
  } catch (error) {
    console.error("Virtual audio service error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.get("/uploads/images/:filename", async (req, res) => {
  try {
    const song = await Song.findOne({ imageUrl: "/uploads/images/" + req.params.filename });
    if (!song || !song.imageData) {
      return res.status(404).send("Image file not found in database.");
    }
    res.set("Content-Type", song.imageContentType || "image/png");
    res.send(song.imageData);
  } catch (error) {
    console.error("Virtual image service error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.get("/", (req, res) => {
  res.json({ message: "MyMusic Backend API (PostgreSQL) is running successfully!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler Catch:", err);
  res.status(500).json({ 
    message: err.message || "Internal Server Error", 
    error: err.toString(),
    stack: err.stack 
  });
});

const PORT = process.env.PORT || 5000;

initDb()
  .then(() => {
    console.log("PostgreSQL Connected & Tables Initialized");
    if (require.main === module) {
      app.listen(PORT, () => {
        console.log(`Server Running on port ${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error("PostgreSQL connection failed:", err.message);
    if (require.main === module) {
      app.listen(PORT, () => {
        console.log(`Server Running on port ${PORT} (Warning: DB Connection Failed)`);
      });
    }
  });

module.exports = app;
