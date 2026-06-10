const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists =
      await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user =
      await User.findOne({ email });

    if (
      user &&
      (await bcrypt.compare(
        password,
        user.password
      ))
    ) {
      const token = jwt.sign(
        {
          id: user._id
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d"
        }
      );

      return res.json({
        token,
        user
      });
    }

    res.status(400).json({
      message: "Invalid Credentials"
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;