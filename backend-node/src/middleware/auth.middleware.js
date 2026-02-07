const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Check for token in Authorization header first
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.query.token) {
    // Fallback to query parameter for audio/video streaming
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authorization token missing"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, companyId }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

