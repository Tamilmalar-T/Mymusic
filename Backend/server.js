require("dotenv").config();

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

app.listen(process.env.PORT, () => {
  console.log(
    `Server Running ${process.env.PORT}`
  );
});