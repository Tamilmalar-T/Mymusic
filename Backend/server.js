require("dotenv").config();

const dns = require("dns");
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes =
  require("./routes/authRoutes");

const songRoutes =
  require("./routes/songRoutes");

const app = express();

app.use(cors());

app.use(express.json());

app.use(
  "/uploads",
  express.static("uploads")
);

// Fallback virtual file serving from MongoDB for Vercel/serverless environments
const Song = require("./models/Song");

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


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(
      "MongoDB Connected"
    );
  });

app.get("/", (req, res) => {
  res.json({ message: "MyMusic Backend API is running successfully!" });
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

app.listen(process.env.PORT, () => {
  console.log(
    `Server Running ${process.env.PORT}`
  );
});

module.exports = app;