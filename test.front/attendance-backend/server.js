import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.js";
import locationRoutes from "./routes/location.js";
import geofenceRoutes from "./routes/geofence.js";
import sessionRoutes from "./routes/session.js";
import attendanceRoutes from "./routes/attendance.js";
import http from "http";
import express from "express";
import setupSocket from "./socket.js";

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://your-deployed-frontend.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `CORS policy: This origin is not allowed -> ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/attendance", authMiddleware, attendanceRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/locations", locationRoutes);
app.use("/api/geofence", authMiddleware, geofenceRoutes);
app.use("/sessions", sessionRoutes);

const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const server = http.createServer(app);
const io = setupSocket(server, app);

server.listen(PORT, () => console.log("listening", PORT));
