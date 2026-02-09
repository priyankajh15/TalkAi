const rateLimit = require("express-rate-limit");

const getClientKey = (req) => {
  if (req.user?.userId) {
    return `user:${req.user.userId}`;
  }
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip;
  return `ip:${ip}`;
};

// Base Limiter (global, soft)
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_GLOBAL) || 100,
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => getClientKey(req),

  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests. Please try again later."
    });
  }
});

// Strict limiter (auth endpoints)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH) || 10,
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => getClientKey(req),

  handler: (req, res) => {
    res.status(429).json({
      message: "Too many login attempts. Try again later."
    });
  }
});

module.exports = {
  globalLimiter,
  authLimiter
};
