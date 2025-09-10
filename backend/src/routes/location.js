import express from "express";
import Location from "../models/Location.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const locations = await Location.find();
  res.json(locations);
});

router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  const { name, center, radiusMeters } = req.body;
  if (!name || !center || !radiusMeters)
    return res.status(400).json({ error: "Missing fields" });
  const loc = await Location.create({
    name,
    center,
    radiusMeters,
    createdBy: req.user._id,
  });
  res.json(loc);
});

export default router;
