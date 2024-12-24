const mongoose = require("mongoose");

const AvailabilitySchema = new mongoose.Schema({
  professorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  slots: [
    {
      date: { type: Date, required: true },
      time: { type: String, required: true },

      isBooked: { type: Boolean, default: false },
    },
  ],
});
const Availability = mongoose.model("Availability", AvailabilitySchema);
module.exports = Availability;
