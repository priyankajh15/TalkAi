const mongoose = require("mongoose");

const KnowledgeBaseSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    category: { type: String, index: true },
    title: { type: String },
    content: { type: String, required: true },

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Compound index for frequent queries
KnowledgeBaseSchema.index({ companyId: 1, isActive: 1, createdAt: -1 });

module.exports = mongoose.model("KnowledgeBase", KnowledgeBaseSchema);
