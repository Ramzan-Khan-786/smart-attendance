const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  registerAdmin,
  loginAdmin,
  getUser,
  getAdmin,
} = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

router.post("/register/user", registerUser);
router.post("/login/user", loginUser);
router.post("/register/admin", registerAdmin);
router.post("/login/admin", loginAdmin);
router.get("/user", auth, getUser);
router.get("/admin", auth, getAdmin);

module.exports = router;
