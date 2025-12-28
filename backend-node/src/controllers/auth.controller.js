const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Company = require("../models/Company.model");
const CompanyUser = require("../models/CompanyUser.model");

exports.signup = async (req, res) => {
  try {
    const { companyName, email, password } = req.body;

    if (!companyName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await CompanyUser.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const company = await Company.create({ companyName });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await CompanyUser.create({
      companyId: company._id,
      name: "Admin",
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Signup successful",
      companyId: company._id,
      userId: user._id,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await CompanyUser.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, companyId: user.companyId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
