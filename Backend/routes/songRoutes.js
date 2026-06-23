const express = require("express");
const multer = require("multer");

const Song = require("../models/Song");

const router = express.Router();

// Multer in-memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit
  }
});

// Accepts both audio file and cover image file
router.post(
  "/upload",
  upload.fields([
    { name: "song", maxCount: 1 },
    { name: "image", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const songFile = req.files && req.files["song"] ? req.files["song"][0] : null;
      const imageFile = req.files && req.files["image"] ? req.files["image"][0] : null;

      if (!songFile) {
        return res.status(400).json({ message: "Audio file is required." });
      }

      // Generate virtual filenames
      const songFilename = Date.now() + "-" + songFile.originalname.replace(/\s+/g, "_");
      const fileUrl = "/uploads/songs/" + songFilename;

      let imageUrl = "";
      let imageData = null;
      let imageContentType = "";

      if (imageFile) {
        const imageFilename = Date.now() + "-" + imageFile.originalname.replace(/\s+/g, "_");
        imageUrl = "/uploads/images/" + imageFilename;
        imageData = imageFile.buffer;
        imageContentType = imageFile.mimetype;
      } else {
        const defaultImages = ["/images/pop.png", "/images/movie.png", "/images/acoustic.png"];
        imageUrl = defaultImages[Math.floor(Math.random() * defaultImages.length)];
      }

      const song = await Song.create({
        title: req.body.title,
        artist: req.body.artist,
        fileUrl,
        imageUrl,
        audioData: songFile.buffer,
        audioContentType: songFile.mimetype,
        imageData,
        imageContentType
      });

      // Exclude binary buffers from the JSON response
      const responseSong = song.toObject();
      delete responseSong.audioData;
      delete responseSong.imageData;

      res.json(responseSong);
    } catch (error) {
      console.error("Backend upload error:", error);
      res.status(500).json({ message: error.message || "Internal Server Error" });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    // Select all fields except the large binary data
    const songs = await Song.find().select("-audioData -imageData");
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});

module.exports = router;