const express = require("express");
const router = express.Router();

const { validateSignup, validateLogin } = require("../validators/auth.validator");
const { signup, login, getMe } = require("../controllers/auth.controller");
const { authLimiter } = require("../middleware/rateLimit.middleware");
const auth = require("../middleware/auth.middleware");

router.post("/signup", validateSignup, authLimiter, signup);
router.post("/login", validateLogin, authLimiter, login);
router.get("/me", auth, getMe);

module.exports = router;

