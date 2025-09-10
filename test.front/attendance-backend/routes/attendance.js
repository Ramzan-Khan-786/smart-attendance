// backend/routes/attendance.js
import express from "express";
import Attendance from "../models/Attendance.js";
import ActiveGeofence from "../models/ActiveGeofence.js";
import Geofence from "../models/Geofence.js";

const router = express.Router();

/**
 * GET /api/attendance/present?sessionId=<sessionId>
 * Returns list of users who have checked in for a session.
 */
router.get("/present", async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

    const records = await Attendance.find({ sessionId }).populate(
      "user",
      "name employeeId"
    );
    const users = records.map((r) => ({
      _id: r.user?._id || null,
      name: r.user?.name || r.userName || "Unknown",
      employeeId: r.user?.employeeId || null,
      checkInAt: r.checkInAt,
      location: r.location,
    }));

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/attendance/checkin
 * body: { lat, lng }
 * Will check if there is an active geofence and if the user's point is inside it; then create attendance.
 */
router.post("/checkin", async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Not authenticated" });

    const { lat, lng } = req.body;
    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ error: "lat and lng required" });
    }

    const active = await ActiveGeofence.findOne().populate("geofence");
    if (!active) return res.status(400).json({ error: "No active geofence" });

    // Server-side check: determine if (lat,lng) inside active.geofence
    const gf = active.geofence;
    if (!gf) return res.status(500).json({ error: "Geofence data missing" });

    // Helper functions:
    const pointInCircle = (pt, center, radiusMeters) => {
      // Haversine distance
      const toRad = (deg) => (deg * Math.PI) / 180;
      const R = 6371000; // meters
      const dLat = toRad(pt.lat - center.lat);
      const dLon = toRad(pt.lng - center.lng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(center.lat)) *
          Math.cos(toRad(pt.lat)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;
      return d <= radiusMeters;
    };

    const pointInPolygon = (pt, polygon) => {
      // ray-casting algorithm
      let x = pt.lng,
        y = pt.lat;
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lng,
          yi = polygon[i].lat;
        const xj = polygon[j].lng,
          yj = polygon[j].lat;
        const intersect =
          yi > y !== yj > y &&
          x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    };

    let isInside = false;
    if (gf.coords.type === "circle") {
      isInside = pointInCircle(
        { lat, lng },
        gf.coords.center,
        gf.coords.radius || 50
      );
    } else if (gf.coords.type === "polygon") {
      isInside = pointInPolygon({ lat, lng }, gf.coords.polygon || []);
    }

    if (!isInside) {
      return res.status(400).json({ error: "Not inside active geofence" });
    }

    // Create or upsert attendance: one per user per session
    const attendanceData = {
      user: user._id,
      userName: user.name,
      sessionId: active._id,
      geofenceId: gf._id,
      location: { lat, lng },
      method: "auto",
    };

    // Upsert: if exists, return existing (prevents duplicates)
    const existing = await Attendance.findOne({
      user: user._id,
      sessionId: active._id,
    });
    if (existing) {
      return res.json({
        success: true,
        attendance: existing,
        message: "Already checked in",
      });
    }

    const created = await Attendance.create(attendanceData);

    // Optionally emit socket event (if socket server available)
    try {
      if (req.app && req.app.get("io")) {
        const io = req.app.get("io");
        io.emit("attendance:checked-in", {
          sessionId: active._id,
          user: {
            _id: user._id,
            name: user.name,
            employeeId: user.employeeId || null,
          },
          checkInAt: created.checkInAt,
        });
      }
    } catch (e) {
      // ignore
    }

    res.json({ success: true, attendance: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
