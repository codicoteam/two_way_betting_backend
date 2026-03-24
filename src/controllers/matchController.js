const matchService = require('../services/matchService');
const Match = require('../models/match');

exports.getUpcomingMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({ status: 'NS' }).sort({ startTime: 1 });
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