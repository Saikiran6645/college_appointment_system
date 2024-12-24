const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  professorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ["active", "canceled"], default: "active" },
});
const Appointment = mongoose.model("Appointment", AppointmentSchema);
module.exports = Appointment;
