const AdminLog = require('../models/adminLog');
const logger = require('../utils/logger');

/**
 * Middleware to log admin actions
 * Should be used after admin authentication
 */
exports.auditLog = (actionType) => {
  return async (req, res, next) => {
    // Store original res.json to capture response
    const originalJson = res.json;
    res.json = function(data) {
      res.locals.responseData = data;
      originalJson.call(this, data);
    };

    next();

    // After response is sent, log if successful
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user && req.user.role === 'admin') {
        try {
          await AdminLog.create({
            adminId: req.user._id,
            action: actionType,
            targetType: req.params.id ? 'single' : 'bulk',
            targetId: req.params.id || null,
            oldData: req.oldData || null, // Can be set by controllers if needed
            newData: req.body,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            metadata: {
              method: req.method,
              url: req.originalUrl,
              query: req.query,
            },
          });
          logger.info(`Admin action logged: ${actionType} by ${req.user.email}`);
        } catch (error) {
          logger.error('Failed to create admin log:', error);
        }
      }
    });
  };
};