const MatchChat = require('../models/match-chat');
const Bet = require('../models/bet');
const betService = require('./betService');

const buildBetOfferPayload = async ({ matchId, userId, betOffer }) => {
  if (betOffer.betId) {
    const bet = await Bet.findById(betOffer.betId);
    if (!bet) throw new Error('Referenced bet not found');

    return {
      betId: bet._id,
      marketType: bet.marketType,
      creatorPrediction: bet.creatorPrediction,
      odds: bet.odds,
      creatorStake: bet.creatorStake,
      outcome: betOffer.outcome || bet.creatorPrediction,
      status: bet.status,
    };
  }

  const createdBet = await betService.createBet({
    matchId,
    marketType: betOffer.marketType,
    creatorPrediction: betOffer.creatorPrediction,
    odds: betOffer.odds,
    creatorStake: betOffer.creatorStake,
  }, userId);

  return {
    betId: createdBet._id,
    marketType: createdBet.marketType,
    creatorPrediction: createdBet.creatorPrediction,
    odds: createdBet.odds,
    creatorStake: createdBet.creatorStake,
    outcome: betOffer.outcome || createdBet.creatorPrediction,
    status: createdBet.status,
  };
};

/**
 * Post a message to a match chat
 */
exports.postMessage = async ({ matchId, userId, message, betOffer }) => {
  const payload = {
    matchId,
    userId,
    type: betOffer ? 'bet_offer' : 'message',
  };

  if (betOffer) {
    payload.betOffer = await buildBetOfferPayload({ matchId, userId, betOffer });
  }

  payload.message = message && message.trim()
    ? message.trim()
    : payload.betOffer
      ? `Bet Offer: ${payload.betOffer.outcome || 'details available'}`
      : '';

  const chatMessage = await MatchChat.create(payload);

  // Populate user info for real-time delivery
  const populated = await chatMessage.populate('userId', 'name avatar');

  // Emit via socket to all users in that match room
  const { getIO } = require('../sockets');
  const io = getIO();
  if (io) {
    io.to(`match:${matchId}`).emit('chatMessage', populated);
  }

  return populated;
};

/**
 * Get recent messages for a match
 */
exports.getMatchMessages = async (matchId, limit = 50) => {
  const messages = await MatchChat.find({ matchId })
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
  return messages.reverse(); // return oldest first
};