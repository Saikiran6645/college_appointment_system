const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/authRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
// Load environment variables
dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Define the port
const PORT = process.env.PORT || 5000;
app.use("/api/auth", userRoutes);
app.use("/api/available", availabilityRoutes);
app.use("/api/appointments", appointmentRoutes);
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
