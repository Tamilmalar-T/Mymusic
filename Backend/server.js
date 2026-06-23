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

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(
      "MongoDB Connected"
    );
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