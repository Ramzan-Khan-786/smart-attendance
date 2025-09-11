const Location = require("../models/Location");
const Session = require("../models/Session");
const Attendance = require("../models/Attendance");
const generateExcel = require("../utils/generateExcel");
const path = require("path");

exports.addLocation = async (req, res) => {
  const { name, latitude, longitude } = req.body;
  try {
    const newLocation = new Location({ name, latitude, longitude });
    const location = await newLocation.save();
    res.json(location);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.startSession = async (req, res) => {
  const { name, locationId } = req.body;
  try {
    const location = await Location.findById(locationId);
    if (!location) return res.status(404).json({ msg: "Location not found" });
    await Session.updateMany(
      { isActive: true },
      { isActive: false, endTime: Date.now() }
    );
    const newSession = new Session({ name, location: locationId });
    await newSession.save();
    global.io.emit("session-started", { session: newSession, location });
    res.json(newSession);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.endSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ msg: "Session not found" });
    session.isActive = false;
    session.endTime = Date.now();
    const attendanceRecords = await Attendance.find({
      session: req.params.id,
    }).populate("user", "name email");
    const filePath = await generateExcel(attendanceRecords, session.name);
    session.excelPath = filePath;
    await session.save();
    global.io.emit("session-ended", { sessionId: req.params.id });
    res.json({ msg: "Session ended", session });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.getPresentUsers = async (req, res) => {
  try {
    const activeSession = await Session.findOne({ isActive: true });
    if (!activeSession) return res.json([]);
    const attendance = await Attendance.find({
      session: activeSession._id,
    }).populate("user", "name email");
    res.json(attendance);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.getPreviousSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      isActive: false,
      excelPath: { $ne: null },
    }).sort({ startTime: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.downloadReport = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "..", "reports", filename);
  res.download(filePath, (err) => {
    if (err) {
      res.status(404).send({ message: "File not found." });
    }
  });
};
