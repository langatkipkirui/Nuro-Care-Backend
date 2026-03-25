const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  additionalNotes: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    required: true,
  },
  allergies: {
    type: String,
    default: '',
  },

  alternatePhone: {
    type: String,
    default: '',
  },

  amount: {
    type: String,
    default: null,
  },
  area: {
    type: String,
    required: true,
  },
  caregiver: {
    type: String,
    default: null,
  },
  caregiverGender: {
    type: String,
    default: null,
  },
  county: {
    type: String,
    required: true,
  },
  daysPerWeek: {
    type: String,
    default: '7',
  },
  deviceType: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    required: true,
  },

  fullName: {
    type: String,
    required: true,
  },
  hoursPerDay: {
    type: String,
    default: '24',
  },
  howDidYouHear: {
    type: String,
    default: '',
  },
  landmark: {
    type: String,
    default: '',
  },
  languagePreference: [String],
  medicalCondition: {
    type: String,
    default: '',
  },
  medications: {
    type: String,
    default: '',
  },
  mobility: {
    type: String,
    dfeault: '',
  },
  paid: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Pending',
  },
  patientAge: {
    type: Number,
    default: null,
  },
  patientGender: {
    type: String,
    default: null,
  },
  patientName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  preferredDate: {
    type: Date,
    required: true,
  },
  preferredTime: {
    type: String,
    default: 'day',
  },
  relationship: {
    type: String,
    default: '',
  },
  serviceDuration: {
    type: String,
    default: '',
  },
  serviceType: {
    type: String,
    required: true,
  },
  specialRequirements: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: [
      'Confirmed',
      'Pending',
      'In Progress',
      'Completed',
      'Cancelled',
      'Under Review',
      'Interview Scheduled',
    ],
  },
  submittedAt: {
    type: Date,
    default: new Date(),
  },
  termsAccepted: {
    type: Boolean,
    default: false,
  },
  urgency: {
    type: String,
    default: '',
  },
});

module.exports = mongoose.model('Appointments', AppointmentSchema);
