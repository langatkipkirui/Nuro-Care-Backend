const Appointment = require('../models/appointments-models');
const jwt = require('jsonwebtoken');
// create a new appointment handler
async function newAppointment(req, res) {
  try {
    const {
      fullName,
      email,
      phone,
      alternatePhone,
      county,
      area,
      address,
      landmark,
      serviceType,
      serviceCategory,
      urgency,
      preferredDate,
      preferredTime,
      patientName,
      patientAge,
      patientGender,
      relationship,
      medicalCondition,
      medications,
      allergies,
      mobility,
      specialRequirements,
      caregiverGender,
      languagePreference,
      experienceLevel,
      serviceDuration,
      hoursPerDay,
      daysPerWeek,
      additionalNotes,
      howDidYouHear,
      termsAccepted,
      submittedAt,
      deviceType,
    } = req.body.appointmentData;
    const newlyCreatedAppointment = new Appointment({
      additionalNotes,
      address,
      allergies,
      alternatePhone,
      amount: null,
      area,
      caregiver: '',
      caregiverGender,
      county,
      daysPerWeek,
      deviceType,
      email,
      experienceLevel,
      fullName,
      hoursPerDay,
      howDidYouHear,
      landmark,
      languagePreference,
      medicalCondition,
      medications,
      mobility,
      paid: 'Pending',
      patientAge,
      patientGender,
      patientName,
      phone,
      preferredDate,
      preferredTime,
      relationship,
      serviceDuration,
      serviceType,
      specialRequirements,
      status: 'Pending',
      submittedAt,
      termsAccepted,
      urgency,
    });

    newlyCreatedAppointment.save();
    res.status(201).json({
      success: true,
      message: 'Appointment made successfully',
      newlyCreatedAppointment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Some error occurred. Please try again',
      error: error?.message,
    });
  }
}

async function fetchPatientAppointments(req, res) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No token provided',
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userAppointments = await Appointment.find({ email: decoded.email });

    if (!userAppointments) {
      return res.status(404).json({
        success: false,
        message: 'You do not have any appointments now.',
      });
    }
    res.status(200).json({
      success: true,
      userAppointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to authenticate token',
      error: error?.message,
    });
  }
}

async function fetchAllAppointmentsForAdmin(req, res) {
  try {
    const getAllAppointments = await Appointment.find({});
    if (!getAllAppointments) {
      return res.status(404).json({
        sucess: false,
        message: 'No appointments at the moment',
      });
    }

    res.status(200).json({
      sucess: true,
      allAppointments: getAllAppointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to authenticate token',
      error: error?.message,
    });
  }
}

module.exports = {
  newAppointment,
  fetchPatientAppointments,
  fetchAllAppointmentsForAdmin,
};
