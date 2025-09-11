const mongoose = require("mongoose");
const AttendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  session: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
  timestamp: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
});
module.exports = mongoose.model("Attendance", AttendanceSchema);
