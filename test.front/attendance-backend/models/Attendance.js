// backend/models/Attendance.js
import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String }, // denormalized for quick UI
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "ActiveGeofence" }, // link to active session
  geofenceId: { type: mongoose.Schema.Types.ObjectId, ref: "Geofence" }, // which geofence
  checkInAt: { type: Date, default: Date.now },
  location: { lat: Number, lng: Number }, // user location at checkin
  method: { type: String, enum: ["auto", "manual"], default: "auto" }, // how checkin happened
});

AttendanceSchema.index(
  { user: 1, sessionId: 1 },
  { unique: true, sparse: true }
); // one attendance per user per session

export default mongoose.model("Attendance", AttendanceSchema);
