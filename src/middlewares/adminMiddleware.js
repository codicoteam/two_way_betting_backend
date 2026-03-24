const { USER_ROLE } = require('../utils/constants');

/**
 * Restrict access to admin users only
 */
exports.adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  if (req.user.role !== USER_ROLE.ADMIN) {
    return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }

  next();
};

/**
 * Restrict access to admin or support staff
 */
exports.staffOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  if (![USER_ROLE.ADMIN, USER_ROLE.SUPPORT].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied. Staff only.' });
  }

  next();
};