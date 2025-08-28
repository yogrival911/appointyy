const Clinic = require("../models/Clinic");
const User = require("../models/userModel");

// Create clinic
const createClinic = async (req, res) => {
  try {
    const clinic = await Clinic.create({ ...req.body, owner: req.user._id });
    res.status(201).json(clinic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all clinics
const getClinics = async (req, res) => {
  const clinics = await Clinic.find().populate("owner doctors", "name email");
  res.json(clinics);
};

// Get single clinic
const getClinicById = async (req, res) => {
  const clinic = await Clinic.findById(req.params.id).populate(
    "owner doctors appointments.patient appointments.doctor",
    "name email"
  );
  if (clinic) res.json(clinic);
  else res.status(404).json({ message: "Clinic not found" });
};

// PUT /api/clinics/:id
const updateClinic = async (req, res) => {
  try {
    const { id } = req.params;

    const clinic = await Clinic.findByIdAndUpdate(
      id,
      req.body, // fields to update (name, address, owner, doctors)
      { new: true, runValidators: true }
    ).populate("owner doctors", "name email");

    if (!clinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }

    res.json(clinic);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/clinics/:id
const deleteClinic = async (req, res) => {
  try {
    const { id } = req.params;

    const clinic = await Clinic.findByIdAndDelete(id);

    if (!clinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }

    res.json({ message: "Clinic removed successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getDoctorsByClinic = async (req, res) => {
  try {
    const clinicId = req.params.clinicId;
    const clinic = await Clinic.findById(clinicId).populate("doctors", "-password");

    if (!clinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }

    res.json(clinic.doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const addDoctorToClinic = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const clinicId = req.params.clinicId;

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }

    // only superadmin or clinic owner should add doctors
    if (
      req.user.role !== "superadmin" &&
      req.user._id.toString() !== clinic.owner.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: You cannot add doctors to this clinic" });
    }

    console.log("request.body>> "+ name + " ");

    // create doctor user
    const doctor = await User.create({
      name,
      email,
      password,
      role: "doctor",
    });

    // push doctor id to clinic
    clinic.doctors.push(doctor._id.toString());
    await clinic.save();
    res.status(201).json({ message: "Doctor added to clinic", doctor });
  } catch (error) {
    console.error("Error while adding doctor:", error);
    res.status(500).json({ message: error.message });
  }
};

const removeDoctorFromClinic = async (req, res) => {
  try {
    const { clinicId, doctorId } = req.params;

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }

    // check role / ownership
    if (
      req.user.role !== "superadmin" &&
      req.user._id.toString() !== clinic.owner.toString()
    ) {
      return res
        .status(403)
        .json({
          message: "Forbidden: You cannot remove doctors from this clinic",
        });
    }

    clinic.doctors = clinic.doctors.filter((id) => id.toString() !== doctorId);
    await clinic.save();

    res.json({ message: "Doctor removed from clinic" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createClinic,
  getClinics,
  getClinicById,
  updateClinic,
  deleteClinic,
  getDoctorsByClinic,
  addDoctorToClinic,
  removeDoctorFromClinic,
};
