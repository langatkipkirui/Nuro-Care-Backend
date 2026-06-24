const Appointment = require('../models/appointments-models');
const User = require('../models/user-model');
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

    await newlyCreatedAppointment.save();

    // Sync booking stats on the user profile when logged-in client books
    try {
      const user = await User.findOne({ 'personalInfo.email': email });
      if (user) {
        user.clientProfile.hasBookedService = true;
        user.clientProfile.totalBookings += 1;
        if (user.location?.area === '' && area) user.location.area = area;
        if (user.personalInfo.phone === '' && phone) {
          user.personalInfo.phone = phone;
        }
        if (user.personalInfo.firstName === '' && fullName) {
          const parts = fullName.trim().split(' ');
          user.personalInfo.firstName = parts[0] || '';
          user.personalInfo.lastName = parts.slice(1).join(' ') || '';
        }
        await user.save();
      }
    } catch (syncErr) {
      console.log('User profile sync after booking:', syncErr?.message);
    }

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

    res.status(200).json({
      success: true,
      userAppointments: userAppointments || [],
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
