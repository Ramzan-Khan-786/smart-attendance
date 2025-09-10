import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import User from "../models/User.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/register", upload.single("photo"), async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      photo: req.file?.path,
    });
    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET
    );
    res.json({ token });
  } catch (err) {
    res.status(400).json({ message: "User registration failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET
    );
    res.json({ token });
  } catch (err) {
    res.status(400).json({ message: "Login failed" });
  }
});

export default router;
