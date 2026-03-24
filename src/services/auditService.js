const AdminLog = require('../models/adminLog');

/**
 * Log an admin action
 */
exports.log = async ({ adminId, action, targetType, targetId, oldData, newData, ipAddress, userAgent, metadata = {} }) => {
  const log = await AdminLog.create({
    adminId,
    action,
    targetType,
    targetId,
    oldData,
    newData,
    ipAddress,
    userAgent,
    metadata,
  });
  return log;
};

/**
 * Get audit logs with filters
 */
exports.getLogs = async (filters = {}, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const query = {};
  if (filters.adminId) query.adminId = filters.adminId;
  if (filters.action) query.action = filters.action;
  if (filters.targetId) query.targetId = filters.targetId;

  const logs = await AdminLog.find(query)
    .populate('adminId', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await AdminLog.countDocuments(query);
  return { logs, total, page, totalPages: Math.ceil(total / limit) };
};