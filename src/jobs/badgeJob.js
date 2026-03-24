const { badgeQueue } = require('./queue');
const User = require('../models/user');
const badgeService = require('../services/badgeService');
const logger = require('../utils/logger');

badgeQueue.process(async (job) => {
  const { userId } = job.data;
  try {
    if (userId) {
      // Check a specific user
      const newlyEarned = await badgeService.checkAndAwardBadges(userId);
      if (newlyEarned.length > 0) {
        logger.info(`Awarded ${newlyEarned.length} badges to user ${userId}`);
      }
    } else {
      // Check all active users (with bets in last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const activeUsers = await User.find({
        'stats.totalBets': { $gt: 0 },
        updatedAt: { $gte: sevenDaysAgo },
      }).select('_id');

      for (const user of activeUsers) {
        await badgeQueue.add({ userId: user._id });
      }
      logger.info(`Queued badge checks for ${activeUsers.length} users`);
    }
  } catch (error) {
    logger.error('Badge job failed:', error);
    throw error;
  }
});

// Schedule badge checks daily at 2 AM
badgeQueue.add(
  {},
  { repeat: { cron: '0 2 * * *' } }
);