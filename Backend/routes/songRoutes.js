const express = require("express");
const multer = require("multer");

const Song = require("../models/Song");

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/songs");
  },

  filename(req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        file.originalname
    );
  }
});

const upload = multer({
  storage
});

router.post(
  "/upload",
  upload.single("song"),
  async (req, res) => {
    try {
      const song = await Song.create({
        title: req.body.title,
        artist: req.body.artist,
        fileUrl:
          "/uploads/songs/" +
          req.file.filename
      });

      res.json(song);
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

router.get("/", async (req, res) => {
  const songs = await Song.find();

  res.json(songs);
});

module.exports = router;