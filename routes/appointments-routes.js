const express = require('express');
const {
  newAppointment,
  fetchPatientAppointments,
  fetchAllAppointmentsForAdmin,
} = require('../controllers/appointment-controller');
const { adminAuth } = require('../controllers/admin-auth-controller');
const appointmentRouter = express.Router();

// create a new appointment
appointmentRouter.post('/new-appointment', newAppointment);
appointmentRouter.get('/get-appointments', fetchPatientAppointments);
appointmentRouter.get(
  '/get-admin-appointments',
  adminAuth,
  fetchAllAppointmentsForAdmin,
);

module.exports = appointmentRouter;
