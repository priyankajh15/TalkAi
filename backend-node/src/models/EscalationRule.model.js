const mongoose = require("mongoose");

const EscalationRuleSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    keywords: [{ type: String }],
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EscalationRule", EscalationRuleSchema);
