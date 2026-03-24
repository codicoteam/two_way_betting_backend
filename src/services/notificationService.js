const Notification = require('../models/notifications');
const { getIO } = require('../sockets');

/**
 * Create a notification and emit via socket if user connected
 */
exports.create = async ({ userId, type, title, message, data = {} }) => {
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    data,
  });

  // Emit via socket if available
  const io = getIO();
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }

  return notification;
};

/**
 * Mark notification as read
 */
exports.markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  return notification;
};

/**
 * Mark all notifications as read for a user
 */
exports.markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

/**
 * Get user notifications with pagination
 */
exports.getUserNotifications = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const unreadCount = await Notification.countDocuments({ userId, isRead: false });
  const total = await Notification.countDocuments({ userId });

  return { notifications, unreadCount, total, page, totalPages: Math.ceil(total / limit) };
};