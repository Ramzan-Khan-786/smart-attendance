import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password, adminId } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ email, password: hashed, adminId });
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET
    );
    res.json({ token });
  } catch (err) {
    res.status(400).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Admin not found" });
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET
    );
    res.json({ token });
  } catch (err) {
    res.status(400).json({ message: "Login failed" });
  }
});

export default router;
