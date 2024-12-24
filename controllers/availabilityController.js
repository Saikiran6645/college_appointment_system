const { connectDB, disconnectDB } = require("../config/db");
const Availability = require("../models/Availability");
const moment = require("moment");

const setAvailability = async (req, res) => {
  const { time, date } = req.body;
  // console.log(req.body);

  try {
    await connectDB();

    if (!moment(date, "DD-MM-YYYY", true).isValid()) {
      throw new Error(`Invalid date format: ${date}. Use "DD-MM-YYYY".`);
    }
    if (!moment(time, "HH:mm", true).isValid()) {
      throw new Error(`Invalid time format: ${time}. Use "HH:mm".`);
    }
    let newSlot = { date, time };
    //converting the date and time to utc because mongodb use utc format to store the date and time
    const utcDateTime = moment(`${date} ${time}`, "DD-MM-YYYY HH:mm").utc(); // UTC time

    newSlot = { date: utcDateTime, time };
    const professorAvailability = await Availability.findOne({
      professorId: req.user.userId,
    });

    if (professorAvailability) {
      const slotExists = professorAvailability.slots.some(
        (slot) =>
          moment(slot.date).utc().startOf("day").format() ===
            moment(newSlot.date).utc().startOf("day").format() &&
          slot.time === newSlot.time
      );

      if (slotExists) {
        return res.status(400).json({ error: "This slot is already added." });
      }
    }
    const availability = await Availability.findOneAndUpdate(
      { professorId: req.user.userId },
      { $push: { slots: newSlot } },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Slot added successfully", availability });
  } catch (error) {
    res.status(400).json({ error: error.message });
  } finally {
    await disconnectDB();
  }
};
const getAvailability = async (req, res) => {
  try {
    await connectDB();
    const availability = await Availability.findOne({
      professorId: req.params.professorId,
    });
    // console.log(availability);
    if (!availability) return res.status(404).send("No availability found");

    const currentDate = new Date();

    const validSlots = availability.slots.filter((slot) => {
      const slotDate = new Date(slot.date);

      if (slotDate.toDateString() === currentDate.toDateString()) {
        return (
          slotDate >= currentDate &&
          slot.time > currentDate.toTimeString().slice(0, 5)
        );
      }
      return slotDate > currentDate;
    });

    res.status(200).send(validSlots);
  } catch (err) {
    res.status(400).send(err.message);
  } finally {
    await disconnectDB();
  }
};

module.exports = { setAvailability, getAvailability };
