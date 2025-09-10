import express from "express";
import Session from "../models/Session.js";
import Location from "../models/Location.js";
import ExcelJS from "exceljs";

const router = express.Router();

// start geofence
router.post("/start", async (req, res) => {
  const { locationId } = req.body;
  const session = await Session.create({ location: locationId });
  res.json(session);
});

// close geofence + export attendance
router.post("/close", async (req, res) => {
  const session = await Session.findOne({ active: true }).populate(
    "attendees.user"
  );
  if (!session) return res.status(400).json({ message: "No active session" });

  session.active = false;
  await session.save();

  // export to Excel
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendance");
  sheet.addRow(["Name", "Email", "Verified"]);

  session.attendees.forEach((a) => {
    sheet.addRow([a.user.name, a.user.email, a.verified ? "Yes" : "No"]);
  });

  const filePath = `./uploads/attendance-${Date.now()}.xlsx`;
  await workbook.xlsx.writeFile(filePath);

  res.json({ message: "Session closed", file: filePath });
});

router.post("/check", async (req, res) => {
  const { lat, lng, sessionId } = req.body;
  const session = await Session.findById(sessionId).populate("location");
  if (!session || !session.active)
    return res.status(400).json({ message: "Session not active" });

  // simple radius check (100m)
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(session.location.lat - lat);
  const dLon = toRad(session.location.lng - lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat)) *
      Math.cos(toRad(session.location.lat)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;

  if (dist <= 100) {
    return res.json({ message: "Inside geofence" });
  }
  res.json({ message: "Outside geofence" });
});

export default router;
