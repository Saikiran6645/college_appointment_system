const express = require("express");
const { verifyToken, isProfessor, isStudent } = require("../middlewares/auth");
const {
  getAppointments,
  bookAppointment,
  cancelAppointment,
} = require("../controllers/appointmentController");
const router = express.Router();
router.get("/", verifyToken, getAppointments);
router.post("/bookAppointment", verifyToken, isStudent, bookAppointment);
router.put(
  "/:appointmentId",
  verifyToken,
  isProfessor,
  cancelAppointment
);
module.exports = router;
