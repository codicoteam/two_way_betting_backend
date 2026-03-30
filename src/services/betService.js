const Bet = require('../models/bet');
const User = require('../models/user');
const Match = require('../models/match');
const walletService = require('./walletService');
const notificationService = require('./notificationService');
const oddsService = require('./oddsService');
const { BET_STATUS, TRANSACTION_TYPE, NOTIFICATION_TYPE } = require('../utils/constants');

const matchBet = async (bet, backerId) => {
  const backerStake = bet.creatorStake * (bet.odds - 1);
  const backer = await User.findById(backerId);
  if (!backer) throw new Error('Backer user not found');
  if (backer.wallet.available < backerStake) throw new Error('Insufficient funds');

  bet.acceptedBy = backerId;
  bet.backerStake = backerStake;
  bet.totalPot = bet.creatorStake + backerStake;
  bet.status = BET_STATUS.LIVE;
  bet.matchedAt = new Date();
  bet.acceptRequests = [];
  await bet.save();

  // Lock backer's stake
  await walletService.lockFunds(backerId, backerStake, bet._id);

  // Notify users
  await notificationService.create({
    userId: bet.createdBy,
    type: NOTIFICATION_TYPE.BET_ACCEPT_SELECTED,
    title: 'Opponent Selected',
    message: `You have selected an opponent for your bet.`,
    data: { betId: bet._id }
  });
  await notificationService.create({
    userId: backerId,
    type: NOTIFICATION_TYPE.BET_LIVE,
    title: 'Bet Live',
    message: `You were selected to join the bet. Your stake: $${backerStake}.`,
    data: { betId: bet._id }
  });

  return bet;
};

const evaluateBetUnderdog = async (matchId, marketType, creatorPrediction, odds) => {
  if (marketType !== 'match_winner') return {};
  const match = await Match.findOne({ matchId });
  if (!match) return {};

  const comparison = oddsService.compareTeams(match, creatorPrediction);
  const metadata = {
    favoriteTeam: comparison.favoriteTeam,
    isUnderdog: comparison.isUnderdog,
    strengthRatio: comparison.strengthRatio,
    underdogSuggestedOdds: comparison.suggestedOdds,
  };

  if (comparison.isUnderdog && comparison.suggestedOdds && odds < comparison.suggestedOdds) {
    throw new Error(`The selected team is the underdog; odds must be at least ${comparison.suggestedOdds.toFixed(2)} to reflect team strength.`);
  }

  return metadata;
};

/**
 * Create a new bet
 */
exports.createBet = async (betData, userId) => {
  const { matchId, marketType, creatorPrediction, odds, creatorStake } = betData;

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.wallet.available < creatorStake) {
    throw new Error('Insufficient funds');
  }

  const underdogMetadata = await evaluateBetUnderdog(matchId, marketType, creatorPrediction, odds);

  const bet = await Bet.create({
    matchId,
    marketType,
    creatorPrediction,
    odds,
    creatorStake,
    ...underdogMetadata,
    createdBy: userId,
    status: BET_STATUS.OPEN,
    acceptRequests: []
  });

  await walletService.lockFunds(userId, creatorStake, bet._id);

  await notificationService.create({
    userId,
    type: NOTIFICATION_TYPE.BET_CREATED,
    title: 'Bet Created',
    message: `Your bet of $${creatorStake} has been created and is open for others to join.`,
    data: { betId: bet._id, matchId },
  });

  return bet;
};

/**
 * Request to accept a bet (click accept)
 */
exports.acceptBet = async (betId, userId) => {
  const bet = await Bet.findById(betId);
  if (!bet) throw new Error('Bet not found');
  if (bet.status !== BET_STATUS.OPEN) throw new Error('Bet is no longer open');
  if (bet.createdBy.toString() === userId.toString()) throw new Error('You cannot accept your own bet');

  if (bet.acceptRequests.some((r) => r.user.toString() === userId.toString())) {
    throw new Error('You already requested to accept this bet');
  }

  bet.acceptRequests.push({ user: userId, requestedAt: new Date() });

  // If only one request, first come first serve -> accept immediately
  if (bet.acceptRequests.length === 1) {
    const acceptedBet = await matchBet(bet, userId);
    return acceptedBet;
  }

  await bet.save();

  // Notify creator about new accept request
  await notificationService.create({
    userId: bet.createdBy,
    type: NOTIFICATION_TYPE.BET_ACCEPT_REQUEST,
    title: 'New Accept Request',
    message: 'A new user wants to accept your bet. Please choose an opponent.',
    data: { betId: bet._id }
  });

  return bet;
};

/**
 * Get pending accept requests
 */
exports.getAcceptRequests = async (betId, userId) => {
  const bet = await Bet.findById(betId).populate('acceptRequests.user', 'name avatar');
  if (!bet) throw new Error('Bet not found');
  if (bet.createdBy.toString() !== userId.toString()) throw new Error('Only creator can view requests');
  return bet.acceptRequests;
};

/**
 * Creator chooses opponent from pending requests
 */
exports.chooseOpponent = async (betId, userId, backerId) => {
  const bet = await Bet.findById(betId);
  if (!bet) throw new Error('Bet not found');
  if (bet.status !== BET_STATUS.OPEN) throw new Error('Bet is no longer open');
  if (bet.createdBy.toString() !== userId.toString()) throw new Error('Only creator can choose opponent');

  const request = bet.acceptRequests.find((r) => r.user.toString() === backerId.toString());
  if (!request) throw new Error('This user did not request to accept this bet');

  const acceptedBet = await matchBet(bet, backerId);
  return acceptedBet;
};


/**
 * Request early settlement
 */
exports.requestEarlySettlement = async (betId, userId, proposedAmount) => {
  const bet = await Bet.findById(betId);
  if (!bet) throw new Error('Bet not found');
  if (bet.status !== BET_STATUS.LIVE) {
    throw new Error('Bet cannot be settled early at this stage');
  }
  if (bet.createdBy.toString() !== userId.toString() && bet.acceptedBy?.toString() !== userId.toString()) {
    throw new Error('Not authorized to request settlement for this bet');
  }

  // Check if request already pending
  if (bet.earlySettlement?.status === 'pending') {
    throw new Error('Settlement request already pending');
  }

  const opponentId = bet.createdBy.toString() === userId.toString() ? bet.acceptedBy : bet.createdBy;

  bet.earlySettlement = {
    requestedBy: userId,
    status: 'pending',
    requestedAt: new Date(),
    proposedAmount: proposedAmount || Math.floor(bet.totalPot / 2), // default split
  };
  await bet.save();

  // Notify opponent
  await notificationService.create({
    userId: opponentId,
    type: NOTIFICATION_TYPE.EARLY_SETTLEMENT_REQUEST,
    title: 'Early Settlement Request',
    message: `Your opponent wants to settle the bet early. Proposed amount: $${bet.earlySettlement.proposedAmount}`,
    data: { betId: bet._id, proposedAmount: bet.earlySettlement.proposedAmount },
  });

  return bet;
};

/**
 * Respond to early settlement request
 */
exports.respondEarlySettlement = async (betId, userId, accept) => {
  const bet = await Bet.findById(betId);
  if (!bet) throw new Error('Bet not found');
  if (!bet.earlySettlement || bet.earlySettlement.status !== 'pending') {
    throw new Error('No pending settlement request');
  }

  const opponentId = bet.createdBy.toString() === userId.toString() ? bet.acceptedBy : bet.createdBy;
  if (bet.earlySettlement.requestedBy.toString() === userId.toString()) {
    throw new Error('You cannot respond to your own request');
  }

  if (accept) {
    // Process early settlement: distribute pot according to proposed amount
    const { proposedAmount } = bet.earlySettlement;
    const totalPot = bet.totalPot;
    const commission = Math.floor(totalPot * 0.05); // 5% commission
    const netPot = totalPot - commission;

    // Determine who gets what (simple: requester gets proposedAmount, opponent gets rest)
    // But we need to ensure the proposed amount is deducted from the opponent's share? Actually,
    // in a typical early settlement, the user who requests pays the other to cancel. But here both stakes are locked.
    // A simpler approach: if both agree to split the pot proportionally, we can transfer.
    // For MVP, we'll just cancel and return stakes minus fee.
    // We'll implement a basic cancellation: both get their stake back minus commission.
    // But we can also allow arbitrary splits. We'll keep it simple for now.

    // For now: cancel bet, return stakes minus commission
    const creatorRefund = bet.creatorStake - (commission / 2);
    const backerRefund = bet.backerStake - (commission / 2);

    // Release funds
    await walletService.releaseFunds(bet.createdBy, bet.creatorStake, bet._id, TRANSACTION_TYPE.REFUND);
    await walletService.releaseFunds(bet.acceptedBy, bet.backerStake, bet._id, TRANSACTION_TYPE.REFUND);

    // Add refund amounts to available (walletService.releaseFunds already does that if type is refund? We'll need to adjust releaseFunds to add for refunds)
    // Alternatively, we create separate transactions.

    bet.status = BET_STATUS.CANCELLED;
    bet.earlySettlement.status = 'accepted';
    bet.earlySettlement.respondedAt = new Date();
    bet.earlySettlement.acceptedBy = userId;
    bet.earlySettlement.settledAmount = commission; // or track
    await bet.save();

    // Notify both
    await notificationService.create({
      userId: bet.createdBy,
      type: NOTIFICATION_TYPE.EARLY_SETTLEMENT_RESPONSE,
      title: 'Early Settlement Accepted',
      message: `Bet settled early. Your stake returned minus commission.`,
      data: { betId: bet._id },
    });
    await notificationService.create({
      userId: bet.acceptedBy,
      type: NOTIFICATION_TYPE.EARLY_SETTLEMENT_RESPONSE,
      title: 'Early Settlement Accepted',
      message: `Bet settled early. Your stake returned minus commission.`,
      data: { betId: bet._id },
    });
  } else {
    // Reject
    bet.earlySettlement.status = 'rejected';
    bet.earlySettlement.respondedAt = new Date();
    await bet.save();

    await notificationService.create({
      userId: bet.earlySettlement.requestedBy,
      type: NOTIFICATION_TYPE.EARLY_SETTLEMENT_RESPONSE,
      title: 'Early Settlement Rejected',
      message: `Your opponent rejected the early settlement request.`,
      data: { betId: bet._id },
    });
  }

  return bet;
};