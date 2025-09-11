const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  addLocation,
  getLocations,
  startSession,
  endSession,
  getPresentUsers,
  getPreviousSessions,
  downloadReport,
} = require("../controllers/adminController");

router.post("/locations", auth, addLocation);
router.get("/locations", auth, getLocations);
router.post("/sessions/start", auth, startSession);
router.put("/sessions/end/:id", auth, endSession);
router.get("/sessions/active/attendance", auth, getPresentUsers);
router.get("/sessions/previous", auth, getPreviousSessions);
router.get("/sessions/download/:filename", auth, downloadReport);

module.exports = router;
