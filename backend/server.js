import http from "http";
import express from "express";
import { Server as IOServer } from "socket.io";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./src/routes/auth.js";
import locationRoutes from "./src/routes/locations.js";
import sessionRoutes from "./src/routes/sessions.js";
import { initSocketHandlers } from "./src/socket/index.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new IOServer(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// middleware
app.use(express.json({ limit: "10mb" })); // for images/descriptors
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// simple root
app.get("/", (req, res) =>
  res.json({ message: "Smart Attendance backend running" })
);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/sessions", sessionRoutes);

// error handler (simple)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

// connect DB and start server
const PORT = process.env.PORT || 4000;
connectDB().then(() => {
  initSocketHandlers(io);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
