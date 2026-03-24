const { settlementQueue } = require('./queue');
const Bet = require('../models/Bet');
const matchService = require('../services/matchService');
const settlementService = require('../services/settlementService');
const logger = require('../utils/logger');

settlementQueue.process(async (job) => {
  const { matchId } = job.data;
  try {
    // Get match result
    const match = await matchService.getMatchById(matchId);
    if (!match) throw new Error(`Match ${matchId} not found`);

    const matchResult = {
      homeScore: match.scores.home,
      awayScore: match.scores.away,
      finalOutcome: match.scores.home > match.scores.away ? 'home' : match.scores.home < match.scores.away ? 'away' : 'draw',
    };

    // Find all unsettled bets for this match
    const bets = await Bet.find({
      matchId,
      status: { $in: ['MATCHED', 'LIVE'] },
    });

    for (const bet of bets) {
      await settlementService.settleBet(bet, matchResult);
    }

    logger.info(`Settled ${bets.length} bets for match ${matchId}`);
  } catch (error) {
    logger.error('Settlement job failed:', error);
    throw error;
  }
});