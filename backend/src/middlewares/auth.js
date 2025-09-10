import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  const auth = req.headers.authorization || req.cookies.token;
  if (!auth) return res.status(401).json({ error: "No token" });

  const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : auth;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-passwordHash -__v");
    if (!user) return res.status(401).json({ error: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  if (req.user.role !== role)
    return res.status(403).json({ error: "Forbidden" });
  next();
};
