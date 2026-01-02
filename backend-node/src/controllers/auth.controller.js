const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Company = require("../models/Company.model");
const CompanyUser = require("../models/CompanyUser.model");
const logger = require("../config/logger");

/**
 * SIGNUP (Atomic: Company + Admin User)
 */
exports.signup = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { companyName, email, password } = req.body;

    // Check duplicate email
    const existing = await CompanyUser.findOne({ email }).session(session);
    if (existing) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: "Email already exists",
        requestId: req.id,
      });
    }

    // Create company
    const [company] = await Company.create(
      [{ companyName }],
      { session }
    );

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const [user] = await CompanyUser.create(
      [
        {
          companyId: company._id,
          name: "Admin",
          email,
          password: hashedPassword,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      companyId: company._id,
      userId: user._id,
    });
  } catch (err) {
    await session.abortTransaction();

    logger.error("Signup transaction failed", {
      requestId: req.id,
      error: err.message,
      stack: err.stack,
      email: req.body?.email,
    });

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again later.",
      requestId: req.id,
    });
  } finally {
    session.endSession();
  }
};

/**
 * LOGIN
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await CompanyUser.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user._id, companyId: user.companyId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
    });
  } catch (err) {
    logger.error("Login failed", {
      requestId: req.id,
      error: err.message,
      stack: err.stack,
      email: req.body?.email,
    });

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again later.",
      requestId: req.id,
    });
  }
};


