const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema(
  {
    // 1. Personal Information
    personalInfo: {
      firstName: {
        type: String,
        trim: true,
        default: '',
      },
      lastName: {
        type: String,
        trim: true,
        default: '',
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
        sparse: true,
        required: true,
      },
      phone: {
        type: String,
        trim: true,
        index: true,
        default: '',
      },
      gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: null,
      },
      dateOfBirth: {
        type: Date,
        default: null,
      },
      avatar: {
        type: String,
        default: null,
      },
      avatarPublicId: {
        type: String,
        default: null,
      },
    },

    // 2. Role & Account State
    role: {
      type: String,
      enum: ['client', 'admin'],
      required: true,
      index: true,
      default: 'client',
    },
    // 3. Location & Geography
    location: {
      county: {
        type: String,
        index: true,
        default: 'Nairobi',
      },
      area: {
        type: String,
        default: '',
      },
    },
    lifecycle: {
      joinedAt: {
        type: Date,
        default: new Date(),
        index: true,
      },
      convertedAt: {
        type: Date,
        default: null,
      },
    },

    // 6. Authentication & Security
    auth: {
      passwordHash: {
        type: String,
      },
      rememberMe: {
        type: Boolean,
        default: false,
      },
      emailVerified: {
        type: Boolean,
        default: false,
      },
      emailVerification: {
        codeHash: String,
        expiresAt: Date,
        attempts: {
          type: Number,
          default: 0,
        },
      },
      provider: {
        type: String,
        enum: ['google', 'emailpass'],
        default: 'emailpass',
      },
      passwordSetup: {
        tokenHash: String,
        expiresAt: Date,
      },
    },

    // 7. Client Profile

    clientProfile: {
      hasBookedService: {
        type: Boolean,
        default: false,
        index: true,
      },
      totalBookings: {
        type: Number,
        default: 0,
      },
      lifetimeValue: {
        type: Number,
        default: 0,
      },
      preferredContactMethod: {
        type: String,
        enum: ['phone', 'whatsapp', 'email'],
        default: 'phone',
      },
    },

    // 8. Billing & Subscription

    billing: {
      hasActiveSubscription: {
        type: Boolean,
        default: false,
        index: true,
      },
      subscriptionTier: {
        type: String,
        enum: ['basic', 'standard', 'premium'],
        default: null,
      },
      subscriptionStart: {
        type: String,
        default: null,
      },
      subscriptionEnd: {
        type: String,
        default: null,
      },
      totalPaid: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('User', UserSchema);
