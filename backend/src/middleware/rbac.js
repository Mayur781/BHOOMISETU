const { ROLES, ROLE_PERMISSIONS } = require('../config/roles');

/**
 * Middleware factory to authorize specific roles
 * @param  {...string} allowedRoles 
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to authorization.'
      });
    }

    // SUPER_ADMIN always has full access
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access Forbidden: Your statutory role (${req.user.role}) is not authorized to perform this operation.`,
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Middleware factory to authorize based on fine-grained permissions
 * @param  {...string} requiredPermissions
 */
const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to authorization.'
      });
    }

    // SUPER_ADMIN has all permissions
    if (req.user.role === ROLES.SUPER_ADMIN) {
      return next();
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const hasAll = requiredPermissions.every(p => userPermissions.includes(p));

    if (!hasAll) {
      return res.status(403).json({
        success: false,
        message: `Access Forbidden: Your statutory role (${req.user.role}) lacks the required statutory permission.`,
        requiredPermissions,
        userRole: req.user.role
      });
    }

    next();
  };
};

module.exports = {
  authorize,
  requirePermission
};
