const mongoose = require("mongoose");

const CallLogSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    callId: { type: String, required: true },
    callerNumber: { type: String },

    startTime: { type: Date },
    endTime: { type: Date },
    duration: { type: Number },

    handledBy: {
      type: String,
      enum: ["AI", "Human"],
    },

    escalationReason: { type: String },
    transcript: { type: String },

    abusiveDetected: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CallLog", CallLogSchema);
