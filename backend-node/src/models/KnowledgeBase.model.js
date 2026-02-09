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
    chunks: [{ type: String }],

    isActive: { type: Boolean, default: true, index: true },
    useInCalls: { type: Boolean, default: true, index: true },
    extractionFailed: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Compound index for frequent queries
KnowledgeBaseSchema.index({ companyId: 1, isActive: 1, createdAt: -1 });

// Text index for efficient search
KnowledgeBaseSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model("KnowledgeBase", KnowledgeBaseSchema);
