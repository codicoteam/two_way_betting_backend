const matchService = require('../services/matchService');
const Match = require('../models/match');
const User = require('../models/user');

exports.getUpcomingMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({ status: 'NS' }).sort({ startTime: 1 });

    // If user is authenticated, personalize the order
    if (req.user) {
      const user = await User.findById(req.user.id).select('preferredSports preferredLeagues');
      if (user && (user.preferredSports.length > 0 || user.preferredLeagues.length > 0)) {
        matches.sort((a, b) => {
          const aPreferred = (user.preferredSports.includes(a.sport) || user.preferredLeagues.includes(a.leagueName)) ? 1 : 0;
          const bPreferred = (user.preferredSports.includes(b.sport) || user.preferredLeagues.includes(b.leagueName)) ? 1 : 0;
          if (aPreferred !== bPreferred) return bPreferred - aPreferred; // Preferred first
          return a.startTime - b.startTime; // Then by time
        });
      }
    }

    res.json({ success: true, data: matches });
  } catch (error) {
    next(error);
  }
};

exports.getLiveMatches = async (req, res, next) => {
  try {
    const matches = await matchService.getLiveMatches();
    res.json({ success: true, data: matches });
  } catch (error) {
    next(error);
  }
};

exports.getMatchById = async (req, res, next) => {
  try {
    const match = await matchService.getMatchById(req.params.id);
    if (!match) throw new Error('Match not found');
    res.json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
};

// Admin only: force refresh
exports.refreshMatches = async (req, res, next) => {
  try {
    const matches = await matchService.fetchUpcomingMatches();
    res.json({ success: true, data: matches });
  } catch (error) {
    next(error);
  }
};