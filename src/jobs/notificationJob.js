const { getQueue } = require('./queue');
const User = require('../models/user');
const Match = require('../models/match');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

const notificationQueue = getQueue('notificationQueue');
if (!notificationQueue) {
  console.warn('⚠️ notificationQueue unavailable (jobs disabled)');
} else {
  notificationQueue.process(async (job) => {
  const { type, data } = job.data;
  try {
    if (type === 'match-reminder') {
      // Find matches starting in 1 hour
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
      const matches = await Match.find({
        startTime: { $lte: oneHourFromNow, $gte: new Date() },
        status: 'NS',
      });

      for (const match of matches) {
        // Find users who have placed bets on this match? Or all users with favorite team?
        // Simplified: notify all users with favorite team
        const users = await User.find({
          $or: [
            { favoriteTeam: match.homeTeam.name },
            { favoriteTeam: match.awayTeam.name },
          ],
        });

        for (const user of users) {
          await notificationService.create({
            userId: user._id,
            type: 'match_reminder',
            title: 'Match Starting Soon',
            message: `${match.homeTeam.name} vs ${match.awayTeam.name} starts in 1 hour.`,
            data: { matchId: match.matchId },
          });
        }
      }
    }
  } catch (error) {
    logger.error('Notification job failed:', error);
    throw error;
  }
});

// Run every 15 minutes to check for upcoming matches
notificationQueue.add(
  { type: 'match-reminder' },
  { repeat: { every: 15 * 60 * 1000 } }
);
}
