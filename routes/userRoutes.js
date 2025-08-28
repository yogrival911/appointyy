const express = require("express");
const router = express.Router();
const { registerUser, authUser } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", authUser);

// Example protected routes
router.get("/admin", protect, authorize("superadmin", "clinicadmin"), (req, res) => {
  res.json({ message: "Admin access granted" });
});

router.get("/doctor", protect, authorize("doctor"), (req, res) => {
  res.json({ message: "Doctor access granted" });
});

router.get("/patient", protect, authorize("patient"), (req, res) => {
  res.json({ message: "Patient access granted" });
});

module.exports = router;
