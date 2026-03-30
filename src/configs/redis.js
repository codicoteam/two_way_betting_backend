const env = require('./env');
let redis;

if (env.REDIS_URL) {
  const Redis = require('ioredis');
  redis = new Redis(env.REDIS_URL, {
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
} else {
  console.warn('⚠️ Redis disabled because REDIS_URL is not set.');
  redis = {
    ping: async () => { throw new Error('Redis disabled'); },
    get: async () => null,
    setex: async () => null,
  };
}

module.exports = redis;