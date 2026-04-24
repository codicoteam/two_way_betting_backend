const Bet = require('../models/bet');
const User = require('../models/user');
const Match = require('../models/match');
const Transaction = require('../models/transaction');
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

  // Update match bet count (bet is now matched, count stays the same)
  await Match.findOneAndUpdate({ matchId: bet.matchId }, { $inc: { betCount: 0 } });

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
  const { matchId, marketType, creatorPrediction, odds: requestedOdds, creatorStake } = betData;

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.wallet.available < creatorStake) {
    throw new Error('Insufficient funds');
  }

  let odds = requestedOdds;
  if (!odds) {
    const match = await Match.findOne({ matchId });
    if (!match) throw new Error('Match not found for odds calculation');
    const oddsSuggestion = oddsService.suggestOdds(match, creatorPrediction);
    odds = oddsSuggestion.suggestedOdds;
  }

  if (!oddsService.validateOdds(odds)) {
    throw new Error('Odds must be between 1.01 and 100');
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

  // Update match bet count
  await Match.findOneAndUpdate({ matchId }, { $inc: { betCount: 1 } });

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

  const requesterId = bet.earlySettlement.requestedBy.toString();
  if (requesterId === userId.toString()) {
    throw new Error('You cannot respond to your own request');
  }

  const opponentId = bet.createdBy.toString() === requesterId ? bet.acceptedBy : bet.createdBy;

  if (accept) {
    const { proposedAmount } = bet.earlySettlement;
    const totalPot = bet.totalPot;
    const commission = Math.floor(totalPot * 0.05);
    const netPot = totalPot - commission;
    const requestAmount = Math.max(0, Math.min(netPot, proposedAmount || Math.floor(netPot / 2)));

    let creatorReturned = 0;
    let backerReturned = 0;
    if (bet.createdBy.toString() === requesterId) {
      creatorReturned = requestAmount;
      backerReturned = netPot - requestAmount;
    } else {
      backerReturned = requestAmount;
      creatorReturned = netPot - requestAmount;
    }

    await walletService.settleLockedFunds(bet.createdBy, bet.creatorStake, creatorReturned, bet._id, TRANSACTION_TYPE.EARLY_SETTLEMENT, 'Early settlement payout for creator');
    await walletService.settleLockedFunds(bet.acceptedBy, bet.backerStake, backerReturned, bet._id, TRANSACTION_TYPE.EARLY_SETTLEMENT, 'Early settlement payout for backer');

    await Transaction.create({
      userId: null,
      type: TRANSACTION_TYPE.COMMISSION,
      amount: commission,
      status: 'completed',
      betId: bet._id,
      description: `Commission collected for early settlement of bet ${bet._id}`,
    });

    bet.status = BET_STATUS.EARLY_SETTLED;
    bet.earlySettlement.status = 'accepted';
    bet.earlySettlement.respondedAt = new Date();
    bet.earlySettlement.acceptedBy = userId;
    bet.earlySettlement.settledAmount = requestAmount;
    bet.earlySettlement.creatorReturned = creatorReturned;
    bet.earlySettlement.backerReturned = backerReturned;
    await bet.save();

    await notificationService.create({
      userId: bet.createdBy,
      type: NOTIFICATION_TYPE.EARLY_SETTLEMENT_RESPONSE,
      title: 'Early Settlement Accepted',
      message: `Early settlement accepted. Your final return is $${creatorReturned}.`,
      data: { betId: bet._id },
    });
    await notificationService.create({
      userId: bet.acceptedBy,
      type: NOTIFICATION_TYPE.EARLY_SETTLEMENT_RESPONSE,
      title: 'Early Settlement Accepted',
      message: `Early settlement accepted. Your final return is $${backerReturned}.`,
      data: { betId: bet._id },
    });

    return bet;
  }

  bet.earlySettlement.status = 'rejected';
  bet.earlySettlement.respondedAt = new Date();
  await bet.save();

  await notificationService.create({
    userId: bet.earlySettlement.requestedBy,
    type: NOTIFICATION_TYPE.EARLY_SETTLEMENT_RESPONSE,
    title: 'Early Settlement Rejected',
    message: 'Your early settlement request was rejected. The bet remains live.',
    data: { betId: bet._id },
  });

  return bet;
};
