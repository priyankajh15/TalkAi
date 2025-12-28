const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    industry: { type: String },
    businessDescription: { type: String },

    twilioNumber: { type: String },
    forwardToNumber: { type: String },

    languageMode: {
      type: String,
      enum: ["english", "hindi", "auto"],
      default: "auto",
    },

    voiceType: {
      type: String,
      enum: ["male", "female"],
      default: "female",
    },

    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },

    minutesUsed: { type: Number, default: 0 },
    minutesLimit: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", CompanySchema);
