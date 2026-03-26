const { getQueue } = require('./queue');
const MatchChat = require('../models/match-chat');
const Notification = require('../models/notifications');
const PrivateMessage = require('../models/private-message');
const logger = require('../utils/logger');

const cleanupQueue = getQueue('cleanupQueue');
if (!cleanupQueue) {
  console.warn('⚠️ cleanupQueue unavailable (jobs disabled)');
} else {
  cleanupQueue.process(async () => {
  try {
    // Delete match chat messages older than 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const chatDeleted = await MatchChat.deleteMany({ createdAt: { $lt: oneDayAgo } });
    logger.info(`Deleted ${chatDeleted.deletedCount} old chat messages`);

    // Delete notifications older than 30 days (TTL index also handles this)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const notifDeleted = await Notification.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
    logger.info(`Deleted ${notifDeleted.deletedCount} old notifications`);

    // Delete old private messages (optional, keep last 30 days)
    const privateDeleted = await PrivateMessage.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
    logger.info(`Deleted ${privateDeleted.deletedCount} old private messages`);
  } catch (error) {
    logger.error('Cleanup job failed:', error);
    throw error;
  }
});

// Run daily at 3 AM
cleanupQueue.add(
  {},
  { repeat: { cron: '0 3 * * *' } }
);
}
