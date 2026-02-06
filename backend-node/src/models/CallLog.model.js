const mongoose = require("mongoose");

const CallLogSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    callId: { type: String, required: true, index: true },
    callerNumber: { type: String },
    receiverNumber: { type: String }, // Target number being called
    botName: { type: String }, // AI personality name

    startTime: { type: Date },
    endTime: { type: Date },
    duration: { type: Number },

    handledBy: {
      type: String,
      enum: ["AI", "Human"],
      index: true,
    },

    escalationReason: { type: String },
    transcript: { type: String },

    abusiveDetected: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index for frequent sorted queries
CallLogSchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model("CallLog", CallLogSchema);
