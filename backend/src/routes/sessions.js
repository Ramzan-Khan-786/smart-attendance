import express from "express";
import Session from "../models/Session.js";
import Attendance from "../models/Attendance.js";
import Location from "../models/Location.js";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { metersBetween } from "../utils/geo.js";
import ExcelJS from "exceljs";

const router = express.Router();

// start session (admin)
router.post(
  "/:locationId/start",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const { locationId } = req.params;
    const loc = await Location.findById(locationId);
    if (!loc) return res.status(404).json({ error: "Location not found" });

    const session = await Session.create({
      locationId: loc._id,
      startedBy: req.user._id,
      startTime: new Date(),
      active: true,
    });

    // emit socket event - we'll emit from socket logic by listening to DB in real world.
    // For simplicity, return session so frontend can emit.
    res.json(session);
  }
);

// stop session (admin) -> finalize & generate excel
router.post(
  "/:sessionId/stop",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (!session.active)
      return res.status(400).json({ error: "Session already stopped" });

    session.endTime = new Date();
    session.active = false;
    await session.save();

    // finalize attendance: compute durations & percentages
    const attendances = await Attendance.find({ sessionId: session._id });
    const totalSeconds = Math.max(
      1,
      Math.floor((session.endTime - session.startTime) / 1000)
    );

    for (const a of attendances) {
      const duration =
        Math.floor(
          ((a.lastSeenAt || a.firstVerifiedAt) -
            (a.firstVerifiedAt || a.lastSeenAt)) /
            1000
        ) || 0;
      a.durationSeconds = duration;
      a.percentageOfClass = Math.min(
        100,
        Math.round((duration / totalSeconds) * 100)
      );
      a.status = a.percentageOfClass >= 90 ? "present" : "failed";
      await a.save();
    }

    // generate excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Attendance");

    sheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Employee ID", key: "employeeId", width: 15 },
      { header: "First Verified", key: "firstVerified", width: 25 },
      { header: "Last Seen", key: "lastSeen", width: 25 },
      { header: "Duration (s)", key: "duration", width: 15 },
      { header: "Percentage", key: "percentage", width: 12 },
      { header: "Status", key: "status", width: 12 },
    ];

    for (const a of attendances) {
      const user = await User.findById(a.userId);
      sheet.addRow({
        name: user?.name || "Unknown",
        email: user?.email || "",
        employeeId: user?.employeeId || "",
        firstVerified: a.firstVerifiedAt ? a.firstVerifiedAt.toISOString() : "",
        lastSeen: a.lastSeenAt ? a.lastSeenAt.toISOString() : "",
        duration: a.durationSeconds,
        percentage: a.percentageOfClass,
        status: a.status,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    // in production save to S3 and store URL. For starter, we return buffer as base64.
    const fileBase64 = buffer.toString("base64");
    session.attendanceSaved = true;
    session.savedExcelUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${fileBase64}`;
    await session.save();

    res.json({ sessionId: session._id, savedExcelUrl: session.savedExcelUrl });
  }
);

// verify attendance from client
router.post("/:sessionId/verify", requireAuth, async (req, res) => {
  const { sessionId } = req.params;
  const { lat, lng, descriptor, method = "auto" } = req.body;
  if (!lat || !lng) return res.status(400).json({ error: "Missing location" });

  const session = await Session.findById(sessionId);
  if (!session || !session.active)
    return res.status(400).json({ error: "Session not active or not found" });

  const location = await Location.findById(session.locationId);
  if (!location) return res.status(404).json({ error: "Location not found" });

  // server-side geofence check
  const meters = metersBetween(
    lat,
    lng,
    location.center.lat,
    location.center.lng
  );
  if (meters > location.radiusMeters) {
    return res.status(400).json({ error: "Outside geofence" });
  }

  // face descriptor match:
  // We stored faceDescriptor for each user at registration. Compare current user's descriptor with stored one.
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ error: "User not found" });
  // if user has stored descriptor and client sent descriptor, compute distance
  let matched = false;
  if (
    user.faceDescriptor &&
    user.faceDescriptor.length &&
    descriptor &&
    descriptor.length
  ) {
    // euclidean distance
    const dist = Math.sqrt(
      user.faceDescriptor.reduce(
        (s, v, i) => s + Math.pow(v - (descriptor[i] || 0), 2),
        0
      )
    );
    const THRESHOLD = 0.65;
    matched = dist < THRESHOLD;
  } else {
    // if descriptors not available, accept (you can change policy)
    matched = true;
  }

  if (!matched) return res.status(400).json({ error: "Face did not match" });

  // create or update attendance
  let attendance = await Attendance.findOne({
    sessionId: session._id,
    userId: req.user._id,
  });
  const now = new Date();
  if (!attendance) {
    attendance = await Attendance.create({
      sessionId: session._id,
      userId: req.user._id,
      firstVerifiedAt: now,
      lastSeenAt: now,
      verifiedBy: method,
    });
  } else {
    attendance.lastSeenAt = now;
    await attendance.save();
  }

  // add participant if not present
  if (
    !session.participants.some((p) => p.toString() === req.user._id.toString())
  ) {
    session.participants.push(req.user._id);
    await session.save();
  }

  res.json({ ok: true, attendanceId: attendance._id });
});

// list active sessions (employee)
router.get("/active", requireAuth, async (req, res) => {
  const active = await Session.find({ active: true }).populate("locationId");
  res.json(active);
});

router.get(
  "/:sessionId/attendance",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const { sessionId } = req.params;
    const attendances = await Attendance.find({ sessionId }).populate(
      "userId",
      "name email employeeId"
    );
    res.json(attendances);
  }
);

export default router;
