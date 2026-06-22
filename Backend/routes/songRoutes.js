const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const Song = require("../models/Song");

const router = express.Router();

// Ensure upload directories exist
const songDir = path.join(__dirname, "../uploads/songs");
const imageDir = path.join(__dirname, "../uploads/images");

if (!fs.existsSync(songDir)) {
  fs.mkdirSync(songDir, { recursive: true });
}
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === "image") {
      cb(null, "uploads/images");
    } else {
      cb(null, "uploads/songs");
    }
  },

  filename(req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        file.originalname.replace(/\s+/g, "_")
    );
  }
});

const upload = multer({
  storage
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

      // Assign default stock cover image if none is uploaded
      let imageUrl = "";
      if (imageFile) {
        imageUrl = "/uploads/images/" + imageFile.filename;
      } else {
        const defaultImages = ["/images/pop.png", "/images/movie.png", "/images/acoustic.png"];
        imageUrl = defaultImages[Math.floor(Math.random() * defaultImages.length)];
      }

      const song = await Song.create({
        title: req.body.title,
        artist: req.body.artist,
        fileUrl: "/uploads/songs/" + songFile.filename,
        imageUrl: imageUrl
      });

      res.json(song);
    } catch (error) {
      console.error("Backend upload error:", error);
      res.status(500).json(error);
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const songs = await Song.find();
    res.json(songs);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;