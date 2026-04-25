const matchService = require('../services/matchService');
const chatService = require('../services/chatService');
const userService = require('../services/userService');
const oddsService = require('../services/oddsService');
const Bet = require('../models/bet');
const User = require('../models/user');

exports.getUpcomingMatches = async (req, res, next) => {
  try {
    const { leagueId, date } = req.query;
    const matches = await matchService.fetchUpcomingMatches(leagueId, date);

    // If user is authenticated, personalize the order
    if (req.user) {
      const user = await User.findById(req.user.id).select('preferredSports preferredLeagues');
      if (user && (user.preferredSports.length > 0 || user.preferredLeagues.length > 0)) {
        matches.sort((a, b) => {
          const aPreferred = (user.preferredSports.includes(a.sport) || user.preferredLeagues.includes(a.leagueName)) ? 1 : 0;
          const bPreferred = (user.preferredSports.includes(b.sport) || user.preferredLeagues.includes(b.leagueName)) ? 1 : 0;
          if (aPreferred !== bPreferred) return bPreferred - aPreferred; // Preferred first
          return new Date(a.startTime) - new Date(b.startTime); // Then by time
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

exports.getOddsSuggestion = async (req, res, next) => {
  try {
    const match = await matchService.getMatchById(req.params.id);
    if (!match) throw new Error('Match not found');
    const prediction = req.query.prediction || null;
    const odds = await oddsService.suggestOdds(match, prediction);
    res.json({ success: true, data: odds });
  } catch (error) {
    next(error);
  }
};

exports.getMatchBetCount = async (req, res, next) => {
  try {
    const match = await matchService.getMatchById(req.params.id);
    if (!match) throw new Error('Match not found');
    const count = await matchService.getBetCount(req.params.id);
    res.json({ success: true, data: { matchId: req.params.id, betCount: count } });
  } catch (error) {
    next(error);
  }
};

const getMatchParticipants = async (matchId, requesterId) => {
  const stakes = await Bet.find({ matchId })
    .populate('createdBy', 'name avatar')
    .populate('acceptedBy', 'name avatar')
    .sort({ createdAt: -1 });

  const participantIds = new Set();
  stakes.forEach((bet) => {
    if (bet.createdBy) participantIds.add(bet.createdBy._id.toString());
    if (bet.acceptedBy) participantIds.add(bet.acceptedBy._id.toString());
  });

  const participants = [];
  for (const participantId of Array.from(participantIds)) {
    try {
      const participantProfile = await userService.getProfile(participantId, requesterId);
      participants.push(participantProfile);
    } catch (error) {
      // Ignore missing users
    }
  }

  return participants;
};

exports.getMatchOverview = async (req, res, next) => {
  try {
    const matchId = req.params.id;
    const match = await matchService.getMatchById(matchId);
    if (!match) throw new Error('Match not found');

    const chatMessages = await chatService.getMatchMessages(matchId, 100);
    const stakes = await Bet.find({ matchId })
      .populate('createdBy', 'name avatar')
      .populate('acceptedBy', 'name avatar')
      .sort({ createdAt: -1 });

    const participants = await getMatchParticipants(matchId, req.user?.id);

    res.json({
      success: true,
      data: {
        match,
        chatMessages,
        stakes,
        participants,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMatchParticipants = async (req, res, next) => {
  try {
    const matchId = req.params.id;
    const match = await matchService.getMatchById(matchId);
    if (!match) throw new Error('Match not found');

    const participants = await getMatchParticipants(matchId, req.user?.id);

    res.json({
      success: true,
      data: { participants },
    });
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