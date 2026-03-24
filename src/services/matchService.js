const Match = require('../models/Match');
const { sportmonksClient } = require('../utils/apiClient');
const logger = require('../utils/logger');

/**
 * Fetch upcoming matches from API and cache in DB
 */
exports.fetchUpcomingMatches = async (leagueId = null, date = null) => {
  try {
    const params = {
      include: 'localTeam,visitorTeam,league',
      ...(date && { date }),
    };
    const endpoint = leagueId ? `leagues/${leagueId}/matches` : 'matches';
    const data = await sportmonksClient.get(endpoint, params);

    // Transform and save to DB
    const matches = data.data.map(apiMatch => ({
      matchId: apiMatch.id,
      leagueId: apiMatch.league_id,
      leagueName: apiMatch.league?.name,
      homeTeam: {
        id: apiMatch.localTeam?.data?.id,
        name: apiMatch.localTeam?.data?.name,
        logo: apiMatch.localTeam?.data?.logo_path,
      },
      awayTeam: {
        id: apiMatch.visitorTeam?.data?.id,
        name: apiMatch.visitorTeam?.data?.name,
        logo: apiMatch.visitorTeam?.data?.logo_path,
      },
      startTime: apiMatch.starting_at,
      status: apiMatch.time?.status || 'NS',
      scores: {
        home: apiMatch.scores?.localteam_score,
        away: apiMatch.scores?.visitorteam_score,
      },
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
  } catch (error) {
    logger.error('Failed to fetch matches:', error);
    throw new Error('Failed to fetch match data');
  }
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
 * Update match status and scores (called by background job)
 */
exports.updateMatch = async (matchId, apiData) => {
  const update = {
    status: apiData.time?.status,
    'scores.home': apiData.scores?.localteam_score,
    'scores.away': apiData.scores?.visitorteam_score,
    lastFetched: new Date(),
  };
  await Match.findOneAndUpdate({ matchId }, update);
};