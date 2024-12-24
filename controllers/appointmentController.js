const { connectDB, disconnectDB } = require("../config/db");
const Appointment = require("../models/Appointment");
const Availability = require("../models/Availability");
const moment = require("moment");

// Book an appointment
const bookAppointment = async (req, res) => {
  const { professorId, date, time } = req.body;

  if (!professorId || !date || !time) {
    return res
      .status(400)
      .json({ error: "Professor ID, date, and time are required" });
  }
  if (!moment(date, "DD-MM-YYYY", true).isValid()) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  if (!moment(time, "HH:mm", true).isValid()) {
    return res.status(400).json({ error: "Invalid time format" });
  }

  try {
    await connectDB();
    const professorAvailability = await Availability.findOne({ professorId });

    if (!professorAvailability) {
      return res
        .status(404)
        .json({ error: "No availability found for the professor" });
    }
    // here we are searching for valid slots
    const currentDate = new Date();
    const validSlots = professorAvailability.slots.filter((slot) => {
      const slotDate = new Date(slot.date);

      if (slotDate.toDateString() === currentDate.toDateString()) {
        return (
          slotDate >= currentDate &&
          slot.time > currentDate.toTimeString().slice(0, 5)
        );
      }
      return slotDate > currentDate;
    });

    const utcDate = moment(`${date} ${time}`, "DD-MM-YYYY HH:mm").utc();
   

    const slot = validSlots.find(
      (s) =>
        moment(s.date).utc().startOf("day").format() ===
          utcDate.startOf("day").format() && s.time === time
    );

    if (!slot) {
      return res.status(400).json({ error: "This slot is not available" });
    }

    if (slot.isBooked) {
      return res.status(400).json({ error: "This slot is already booked" });
    }

    // Marking the slot as booked
    slot.isBooked = true;
    await professorAvailability.save();

    // Creating the appointment
    const appointment = new Appointment({
      professorId,
      studentId: req.user.userId,
      date: utcDate,
      time,
    });
    await appointment.save();

    res
      .status(201)
      .json({ message: "Appointment booked successfully", appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await disconnectDB();
  }
};

// Cancel an appointment
const cancelAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  if (!appointmentId) {
    return res.status(400).json({ error: "Appointment ID is required" });
  }

  try {
    await connectDB();

    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId, professorId: req.user.userId },
      { status: "canceled" },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res
      .status(200)
      .json({ message: "Appointment canceled successfully", appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await disconnectDB();
  }
};

// Get appointments
const getAppointments = async (req, res) => {
  try {
    await connectDB();

    const query =
      req.user.role === "student"
        ? { studentId: req.user.userId }
        : { professorId: req.user.userId };

    const appointments = await Appointment.find(query);

    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await disconnectDB();
  }
};

module.exports = { bookAppointment, cancelAppointment, getAppointments };
