const Bull = require('bull');
const redisConfig = require('../configs/redis');

// Create queues
const matchUpdateQueue = new Bull('match-update', { redis: redisConfig });
const settlementQueue = new Bull('settlement', { redis: redisConfig });
const badgeQueue = new Bull('badge', { redis: redisConfig });
const leaderboardQueue = new Bull('leaderboard', { redis: redisConfig });
const notificationQueue = new Bull('notification', { redis: redisConfig });
const expiryQueue = new Bull('expiry', { redis: redisConfig });
const cleanupQueue = new Bull('cleanup', { redis: redisConfig });

module.exports = {
  matchUpdateQueue,
  settlementQueue,
  badgeQueue,
  leaderboardQueue,
  notificationQueue,
  expiryQueue,
  cleanupQueue,
};