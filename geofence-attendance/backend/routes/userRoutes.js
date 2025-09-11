const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  markAttendance,
  getActiveSession,
} = require("../controllers/userController");

router.post("/attendance/mark", auth, markAttendance);
router.get("/sessions/active", getActiveSession);

module.exports = router;
