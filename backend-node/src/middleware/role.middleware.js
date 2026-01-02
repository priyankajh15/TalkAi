/**
 * Role-based access control middleware
 * @param {string} requiredRole - The role required to access the route
 * @returns {Function} Express middleware function
 */
module.exports = (requiredRole) => (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(403).json({
      success: false,
      message: "Forbidden - No role found"
    });
  }

  if (req.user.role !== requiredRole) {
    return res.status(403).json({
      success: false,
      message: "Forbidden"
    });
  }
  next();
};
