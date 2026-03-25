const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    Title: {
      type: String,
      required: true,
    },
    ServiceCoverImage: {
      type: {
        url: String,
        publicId: String,
      },
      default: null,
    },
    Gallery: {
      type: [
        {
          url: String,
          publicId: String,
        },
      ],
      default: null,
    },
    ServiceSlug: {
      type: String,
      required: true,

      lowercase: true,
    },
    ServiceHeroTitle: {
      type: String,
      required: true,
    },
    MetaDescription: {
      type: String,
      required: true,
    },
    ServiceKeywords: {
      type: [String],
      required: [true, "service keywords are required"],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "The service keywords array cannot be empty.",
      },
    },
    ServiceHeroDescription: {
      type: String,
      required: true,
    },

    ServiceOverview: {
      type: String,
      required: true,
    },
    ServiceBenefits: {
      type: [
        {
          title: {
            type: String,
            required: true,
          },
          description: {
            type: String,
            required: true,
          },
        },
      ],
      required: true,
      validate: [(val) => val.length > 0, "{PATH} cannot be empty"],
    },
    ServiceProcess: {
      type: [
        {
          step: {
            type: Number,
            required: true,
          },
          title: {
            type: String,
            required: true,
          },
          description: {
            type: String,
            required: true,
          },
        },
      ],
      required: true,
      validate: [(val) => val.length > 0, "{PATH} cannot be empty"],
    },
    TargetAudience: {
      type: [
        {
          title: {
            type: String,
            required: true,
          },

          description: {
            type: String,
            required: true,
          },
        },
      ],
      required: true,
      validate: [(val) => val.length > 0, "{PATH} cannot be empty"],
    },
    ServiceInclusion: {
      type: [String],
      required: [true, "service inclusion are required"],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "The service keywords array cannot be empty.",
      },
    },
    ServiceFeatures: {
      type: [
        {
          category: {
            type: String,
            required: true,
          },
          items: [String],
        },
      ],
      required: true,
      validate: [(val) => val.length > 0, "{PATH} cannot be empty"],
    },
    ServiceCoverageAreas: {
      type: [String],
      required: [true, "service coverage areas are required"],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "The service coverage areas array cannot be empty.",
      },
    },
    ServiceFAQs: {
      type: [
        {
          answer: {
            type: String,
            required: true,
          },
          question: {
            type: String,
            required: true,
          },
        },
      ],
      required: true,
      validate: [(val) => val.length > 0, "{PATH} cannot be empty"],
    },
    PricingNote: {
      type: String,
      required: true,
    },
    CTATitle: {
      type: String,
      required: true,
    },
    CTADescription: {
      type: String,
      required: true,
    },
    ServiceDuration: {
      type: String,
      required: true,
    },
    Pricing: {
      dailyRate: {
        type: Number,
        required: true,
      },
      monthlyRate: {
        type: Number,
      },

    },
    // analytics for admin
    Analytics: {
      TotalBookings: {
        type: Number,
        default: 0,
      },
      ActiveCases: {
        type: Number,
        default: 0,
      },
      CompletedCases: {
        type: Number,
        default: 0,
      },
      TotalRevenue: {
        type: Number,
        default: 0,
      },
    },
    IsActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    IsFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ServiceModel", serviceSchema);
