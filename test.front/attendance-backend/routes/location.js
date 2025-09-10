import express from "express";
import Location from "../models/Location.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const locations = await Location.find();
  res.json(locations);
});

router.post("/", auth, async (req, res) => {
  const { name, lat, lng } = req.body;
  const loc = await Location.create({ name, lat, lng });
  res.json(loc);
});

export default router;
