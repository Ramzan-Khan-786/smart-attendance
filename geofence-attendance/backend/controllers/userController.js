const User = require("../models/User");
const Session = require("../models/Session");
const Attendance = require("../models/Attendance");

exports.markAttendance = async (req, res) => {
  const { sessionId, isVerified } = req.body;
  try {
    if (!isVerified)
      return res
        .status(400)
        .json({ msg: "User not verified by face recognition." });
    let attendance = await Attendance.findOne({
      user: req.user.id,
      session: sessionId,
    });
    if (attendance)
      return res.status(400).json({ msg: "Attendance already marked." });
    attendance = new Attendance({
      user: req.user.id,
      session: sessionId,
      isVerified: true,
    });
    await attendance.save();
    const populatedAttendance = await Attendance.findById(
      attendance._id
    ).populate("user", "name");
    global.io.emit("user-verified", { attendance: populatedAttendance });
    res.json(attendance);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.getActiveSession = async (req, res) => {
  try {
    const activeSession = await Session.findOne({ isActive: true }).populate(
      "location"
    );
    if (!activeSession)
      return res.status(404).json({ msg: "No active session" });
    const userAttendance = await Attendance.findOne({
      user: req.user?.id,
      session: activeSession._id,
    });
    res.json({ activeSession, userAttendance });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};
