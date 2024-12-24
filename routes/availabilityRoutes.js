const express = require("express");
const Availability = require("../models/Availability");
const { verifyToken, isProfessor } = require("../middlewares/auth");
const {
  setAvailability,

  getAvailability,
} = require("../controllers/availabilityController");

const router = express.Router();

// Add Availability Slots
router.post("/add", verifyToken, isProfessor, setAvailability);
router.get("/:professorId", verifyToken, getAvailability);

module.exports = router;
