const mongoose = require("mongoose");

const KnowledgeBaseSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    category: { type: String },
    title: { type: String },
    content: { type: String, required: true },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KnowledgeBase", KnowledgeBaseSchema);
