const express = require("express");
const router = express.Router();

const { validateSignup, validateLogin } = require("../validators/auth.validator");
const { validateForgotPassword, validateResetPassword } = require("../validators/passwordReset.validator");
const { signup, login, getMe } = require("../controllers/auth.controller");
const { forgotPassword, resetPassword } = require("../controllers/passwordReset.controller");
const { authLimiter } = require("../middleware/rateLimit.middleware");
const auth = require("../middleware/auth.middleware");

router.post("/signup", validateSignup, authLimiter, signup);
router.post("/login", validateLogin, authLimiter, login);
router.post("/forgot-password", validateForgotPassword, authLimiter, forgotPassword);
router.post("/reset-password/:token", validateResetPassword, authLimiter, resetPassword);
router.get("/me", auth, getMe);

module.exports = router;

