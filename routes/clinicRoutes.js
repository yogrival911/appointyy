const express = require("express");
const {
  createClinic,
  getClinics,
  getClinicById,
  updateClinic,
  deleteClinic,
  addDoctorToClinic,
  getDoctorsByClinic,
  removeDoctorFromClinic
} = require("../controllers/clinicController");
const { bookAppointment } = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// clinic routes
router
  .route("/")
  .post(protect, authorize("superadmin", "clinicadmin"), createClinic)
  .get(protect, authorize("superadmin", "clinicadmin"), getClinics);
router.put(
  "/:id",
  protect,
  authorize("superadmin", "clinicadmin"),
  updateClinic
);
router.delete(
  "/:id",
  protect,
  authorize("superadmin", "clinicadmin"),
  deleteClinic
);
router.route("/:id").get(getClinicById);
router.route("/:id/appointments").post(protect, bookAppointment);

// doctor routes (inside clinic)
router.post("/:clinicId/doctors", protect,  authorize("superadmin", "clinicadmin"), addDoctorToClinic);
router.get("/:clinicId/doctors", protect,  authorize("superadmin", "clinicadmin"), getDoctorsByClinic);
router.delete("/:clinicId/doctors/:doctorId", protect,  authorize("superadmin", "clinicadmin"), removeDoctorFromClinic);

module.exports = router;
