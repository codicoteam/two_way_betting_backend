const Match = require('../models/Match');
const Bet = require('../models/bet');
const notificationService = require('./notificationService');
const { NOTIFICATION_TYPE } = require('../utils/constants');
const { sportsdbClient } = require('../utils/apiClient');
const env = require('../configs/env');
const logger = require('../utils/logger');

/**
 * Fetch upcoming matches from API and cache in DB
 */
exports.fetchUpcomingMatches = async (leagueId = null, date = null) => {
  try {
    return await fetchUpcomingMatchesFromSportsDB(leagueId, date);
  } catch (error) {
    logger.error('Failed to fetch matches:', error);
    throw new Error('Failed to fetch match data');
  }
};

const fetchUpcomingMatchesFromSportsDB = async (leagueId = null, date = null) => {
  const id = leagueId || env.SPORTSDB_LEAGUE_ID || '4328';
  const endpoint = 'eventsnextleague.php';
  const data = await sportsdbClient.get(endpoint, { id });
  const apiMatches = data.events || [];

  const matches = apiMatches.map(apiMatch => ({
    matchId: `sportsdb_${apiMatch.idEvent}`,
    leagueId: apiMatch.idLeague || id,
    leagueName: apiMatch.strLeague,
    homeTeam: {
      id: apiMatch.idHomeTeam,
      name: apiMatch.strHomeTeam,
      logo: apiMatch.strHomeTeamBadge || '',
    },
    awayTeam: {
      id: apiMatch.idAwayTeam,
      name: apiMatch.strAwayTeam,
      logo: apiMatch.strAwayTeamBadge || '',
    },
    startTime: apiMatch.dateEvent && apiMatch.strTime ? new Date(`${apiMatch.dateEvent} ${apiMatch.strTime} UTC`) : new Date(apiMatch.dateEvent),
    status: 'NS',
    scores: {
      home: apiMatch.intHomeScore ? Number(apiMatch.intHomeScore) : 0,
      away: apiMatch.intAwayScore ? Number(apiMatch.intAwayScore) : 0,
    },
    apiProvider: 'thesportsdb',
    apiResponse: apiMatch,
    lastFetched: new Date(),
  }));

  for (const match of matches) {
    await Match.findOneAndUpdate(
      { matchId: match.matchId },
      match,
      { upsert: true, new: true }
    );
  }

  return matches;
};

/**
 * Get live matches from DB
 */
exports.getLiveMatches = async () => {
  return Match.find({ status: 'LIVE' }).sort({ startTime: 1 });
};

/**
 * Get match by ID (from DB)
 */
exports.getMatchById = async (matchId) => {
  return Match.findOne({ matchId });
};

/**
 * Update bet count for a match
 */
exports.updateBetCount = async (matchId) => {
  const count = await Bet.countDocuments({ matchId, status: { $ne: 'CANCELLED' } });
  await Match.findOneAndUpdate({ matchId }, { betCount: count });
  return count;
};

/**
 * Get bet count for a match
 */
exports.getBetCount = async (matchId) => {
  const match = await Match.findOne({ matchId }).select('betCount');
  return match?.betCount || 0;
};

/**
 * Update match status and scores (called by background job)
 */
exports.updateMatch = async (matchId, apiData) => {
  const prevMatch = await Match.findOne({ matchId });
  const prevStatus = prevMatch?.status;
  const newStatus = apiData.time?.status;

  const update = {
    status: newStatus,
    'scores.home': apiData.scores?.localteam_score,
    'scores.away': apiData.scores?.visitorteam_score,
    lastFetched: new Date(),
  };

  await Match.findOneAndUpdate({ matchId }, update);

  // Notify live bettors when match transitions into LIVE
  if (prevStatus !== 'LIVE' && newStatus === 'LIVE') {
    try {
      const liveBets = await Bet.find({
        matchId,
        status: 'LIVE',
      });

      if (liveBets.length > 0) {
        await Bet.updateMany(
          { matchId, status: 'LIVE' },
          { status: 'LIVE', startedAt: new Date() }
        );

        for (const bet of liveBets) {
          const message = `Match started: ${prevMatch.homeTeam.name} vs ${prevMatch.awayTeam.name}. Your bet is now LIVE.`;

          if (bet.createdBy) {
            await notificationService.create({
              userId: bet.createdBy,
              type: NOTIFICATION_TYPE.BET_LIVE,
              title: 'Bet Live',
              message,
              data: { matchId, betId: bet._id.toString() },
            });
          }

          if (bet.acceptedBy && bet.acceptedBy.toString() !== bet.createdBy?.toString()) {
            await notificationService.create({
              userId: bet.acceptedBy,
              type: NOTIFICATION_TYPE.BET_LIVE,
              title: 'Bet Live',
              message,
              data: { matchId, betId: bet._id.toString() },
            });
          }
        }

        logger.info(`Notified ${liveBets.length} live bets for match ${matchId} live start.`);
      }
    } catch (err) {
      logger.error('Failed to notify bettors on match start:', err);
    }
  }
};