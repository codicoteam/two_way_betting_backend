const matchService = require('../services/matchService');
const Match = require('../models/match');
const logger = require('../utils/logger');
const { matchUpdateQueue } = require('./queue');

// Process job: fetch latest match data for a specific match or all live matches
matchUpdateQueue.process(async (job) => {
  const { matchId } = job.data;
  try {
    if (matchId) {
      // Update a specific match
      const apiData = await matchService.fetchMatchFromAPI(matchId); // you'd implement this
      await matchService.updateMatch(matchId, apiData);
      logger.info(`Updated match ${matchId}`);
    } else {
      // Update all live matches
      const liveMatches = await Match.find({ status: 'LIVE' });
      for (const match of liveMatches) {
        const apiData = await matchService.fetchMatchFromAPI(match.matchId);
        await matchService.updateMatch(match.matchId, apiData);
      }
      logger.info(`Updated ${liveMatches.length} live matches`);
    }
  } catch (error) {
    logger.error('Match update job failed:', error);
    throw error;
  }
});

// Schedule job every minute for live matches
matchUpdateQueue.add(
  {},
  { repeat: { every: 60 * 1000 } } // every minute
);