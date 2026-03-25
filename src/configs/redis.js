const Redis = require('ioredis');
const env = require('./env');

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redis.on('connect', () => console.log('✅ Redis connected'));
let errorCount = 0;
redis.on('error', (err) => {
  if (errorCount === 0) {
    console.error('❌ Redis unavailable (suppressing further errors):', err.message);
  }
  errorCount++;
  if (errorCount > 3) return; // Silent after 3
});

module.exports = redis;