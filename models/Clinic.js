const mongoose = require("mongoose");

const clinicSchema = mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  appointments: [{
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, required: true },
    status: { type: String, enum: ["pending", "confirmed", "completed"], default: "pending" }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Clinic", clinicSchema);
