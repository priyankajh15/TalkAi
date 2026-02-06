const mongoose = require("mongoose");

const CompanyUserSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    name: { type: String, required: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String, required: true },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    role: {
      type: String,
      enum: ["company_admin"],
      default: "company_admin",
    },

    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
    },
  },
  { timestamps: true }
);

CompanyUserSchema.post('save', function (error, doc, next) {
  if (error.code === 11000) {
    next(new Error('Email already exists'));
  } else {
    next(error);
  }
});

module.exports = mongoose.model("CompanyUser", CompanyUserSchema);
