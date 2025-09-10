import express from "express";
import Session from "../models/Session.js";

const router = express.Router();

router.get("/active", async (req, res) => {
  const sessions = await Session.find({ active: true }).populate("location");
  res.json(sessions);
});

export default router;
