const Bull = require('bull');
const redisConfig = require('../configs/redis');

// Lazy queue initialization with Redis health check
let queues = null;

const initQueues = async () => {
  if (queues) return queues;

  try {
    await redisConfig.ping(); // Test connection
    queues = {
      matchUpdateQueue: new Bull('match-update', { redis: redisConfig }),
      settlementQueue: new Bull('settlement', { redis: redisConfig }),
      badgeQueue: new Bull('badge', { redis: redisConfig }),
      leaderboardQueue: new Bull('leaderboard', { redis: redisConfig }),
      notificationQueue: new Bull('notification', { redis: redisConfig }),
      expiryQueue: new Bull('expiry', { redis: redisConfig }),
      cleanupQueue: new Bull('cleanup', { redis: redisConfig }),
    };
    console.log('✅ Bull queues initialized');
  } catch (err) {
    console.warn('⚠️ Redis unavailable, queues disabled:', err.message);
    queues = {}; // Keep server running with disabled queues
  }
  return queues;
};

const getQueue = (name) => {
  if (!queues) return null;
  return queues[name] || null;
};

module.exports = { initQueues, getQueue };
