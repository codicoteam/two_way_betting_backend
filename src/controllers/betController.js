const betService = require('../services/betService');
const Bet = require('../models/bet');

exports.createBet = async (req, res, next) => {
  try {
    const bet = await betService.createBet(req.body, req.user.id);
    res.status(201).json({ success: true, data: bet });
  } catch (error) {
    next(error);
  }
};

exports.acceptBet = async (req, res, next) => {
  try {
    const { betId } = req.params;
    const bet = await betService.acceptBet(betId, req.user.id);
    res.json({ success: true, data: bet });
  } catch (error) {
    next(error);
  }
};

exports.getAcceptRequests = async (req, res, next) => {
  try {
    const { betId } = req.params;
    const requests = await betService.getAcceptRequests(betId, req.user.id);
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

exports.chooseOpponent = async (req, res, next) => {
  try {
    const { betId } = req.params;
    const { backerId } = req.body;
    const bet = await betService.chooseOpponent(betId, req.user.id, backerId);
    res.json({ success: true, data: bet });
  } catch (error) {
    next(error);
  }
};

exports.getBets = async (req, res, next) => {
  try {
    const { status, matchId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (matchId) filter.matchId = matchId;
    const bets = await Bet.find(filter)
      .populate('createdBy', 'name avatar')
      .populate('acceptedBy', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: bets });
  } catch (error) {
    next(error);
  }
};

exports.getMatchBets = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const { status } = req.query;
    const filter = { matchId };
    if (status) filter.status = status;
    const bets = await Bet.find(filter)
      .populate('createdBy', 'name avatar')
      .populate('acceptedBy', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: bets });
  } catch (error) {
    next(error);
  }
};

exports.getBetById = async (req, res, next) => {
  try {
    const bet = await Bet.findById(req.params.id)
      .populate('createdBy', 'name avatar')
      .populate('acceptedBy', 'name avatar');
    if (!bet) throw new Error('Bet not found');
    res.json({ success: true, data: bet });
  } catch (error) {
    next(error);
  }
};

exports.requestEarlySettlement = async (req, res, next) => {
  try {
    const { betId } = req.params;
    const { proposedAmount } = req.body;
    const bet = await betService.requestEarlySettlement(betId, req.user.id, proposedAmount);
    res.json({ success: true, data: bet });
  } catch (error) {
    next(error);
  }
};

exports.respondEarlySettlement = async (req, res, next) => {
  try {
    const { betId } = req.params;
    const { accept } = req.body;
    const bet = await betService.respondEarlySettlement(betId, req.user.id, accept);
    res.json({ success: true, data: bet });
  } catch (error) {
    next(error);
  }
};