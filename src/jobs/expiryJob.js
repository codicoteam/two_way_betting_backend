const { getQueue } = require('./queue');
const Bet = require('../models/Bet');
const logger = require('../utils/logger');

const expiryQueue = getQueue('expiryQueue');
if (!expiryQueue) {
  console.warn('⚠️ expiryQueue unavailable (jobs disabled)');
} else {
  expiryQueue.process(async () => {
  try {
    // Find pending early settlement requests older than 2 minutes
    const expiryTime = new Date(Date.now() - 2 * 60 * 1000);
    const expiredRequests = await Bet.find({
      'earlySettlement.status': 'pending',
      'earlySettlement.requestedAt': { $lt: expiryTime },
    });

    for (const bet of expiredRequests) {
      bet.earlySettlement.status = 'expired';
      await bet.save();
      logger.info(`Expired early settlement for bet ${bet._id}`);
    }
  } catch (error) {
    logger.error('Expiry job failed:', error);
    throw error;
  }
});

// Run every minute
expiryQueue.add(
  {},
  { repeat: { every: 60 * 1000 } }
);
}
