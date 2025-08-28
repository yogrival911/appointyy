const Clinic = require("../models/Clinic");

// Book appointment
const bookAppointment = async (req, res) => {
  const { doctorId, date } = req.body;
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) return res.status(404).json({ message: "Clinic not found" });

    const appointment = {
      patient: req.user._id,
      doctor: doctorId,
      date,
      status: "pending",
    };

    clinic.appointments.push(appointment);
    await clinic.save();

    res.status(201).json({ message: "Appointment booked", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { bookAppointment };
