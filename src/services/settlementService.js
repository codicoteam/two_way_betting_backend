const Bet = require('../models/Bet');
const Transaction = require('../models/Transaction');
const walletService = require('./walletService');
const userService = require('./userService');
const notificationService = require('./notificationService');
const { BET_STATUS, TRANSACTION_TYPE, NOTIFICATION_TYPE } = require('../utils/constants');

/**
 * Settle a single bet after match ends
 */
async function settleBet(bet, matchResult) {
  const { homeScore, awayScore, finalOutcome } = matchResult;
  const { marketType, creatorPrediction, createdBy, acceptedBy, totalPot, _id } = bet;

  // Determine winner based on marketType
  let winnerId = null;
  if (marketType === 'match_winner') {
    if (creatorPrediction === finalOutcome) {
      winnerId = createdBy;
    } else {
      winnerId = acceptedBy; // opponent wins if creator's prediction is wrong
    }
  } else if (marketType === 'over_under') {
    const totalGoals = homeScore + awayScore;
    const threshold = parseFloat(creatorPrediction.replace('over', '').replace('under', ''));
    const creatorWins = (creatorPrediction.includes('over') && totalGoals > threshold) ||
                       (creatorPrediction.includes('under') && totalGoals < threshold);
    winnerId = creatorWins ? createdBy : acceptedBy;
  }
  // ... add other market types as needed

  if (!winnerId) {
    // Fallback: mark as disputed
    bet.status = BET_STATUS.DISPUTED;
    await bet.save();
    return;
  }

  // Calculate commission (5%)
  const commissionRate = 0.05;
  const commission = Math.floor(totalPot * commissionRate);
  const payout = totalPot - commission;

  // Update bet
  bet.winnerId = winnerId;
  bet.status = BET_STATUS.COMPLETED;
  bet.resolvedAt = new Date();
  bet.resultData = { homeScore, awayScore, finalOutcome };
  await bet.save();

  // Distribute funds
  const loserId = winnerId.toString() === createdBy.toString() ? acceptedBy : createdBy;

  // Winner gets payout and locked stake is released
  const winnerStake = winnerId.toString() === createdBy.toString() ? bet.creatorStake : bet.backerStake;
  await walletService.settleLockedFunds(winnerId, winnerStake, payout, _id, TRANSACTION_TYPE.BET_WIN, `Winnings from bet ${_id}`);

  // Loser's locked stake is removed without addition
  const loserStake = winnerId.toString() === createdBy.toString() ? bet.backerStake : bet.creatorStake;
  await walletService.settleLockedFunds(loserId, loserStake, 0, _id, TRANSACTION_TYPE.BET_RELEASE, `Released losing stake for bet ${_id}`);

  // Record commission transaction
  await Transaction.create({
    userId: null, // platform
    type: TRANSACTION_TYPE.COMMISSION,
    amount: commission,
    status: 'completed',
    betId: _id,
    description: `Commission for bet ${_id}`,
  });

  // Update user stats
  const winnerProfit = payout - (winnerId.toString() === createdBy.toString() ? bet.creatorStake : bet.backerStake);
  await userService.updateStats(winnerId, { won: true, profit: winnerProfit });
  await userService.updateStats(loserId, { won: false, profit: -loserStake });

  // Notify both users
  await notificationService.create({
    userId: winnerId,
    type: NOTIFICATION_TYPE.BET_SETTLED,
    title: 'You Won!',
    message: `Your bet has been settled. You won $${payout}.`,
    data: { betId: _id, payout, winner: true },
  });

  await notificationService.create({
    userId: loserId,
    type: NOTIFICATION_TYPE.BET_SETTLED,
    title: 'Bet Lost',
    message: `Your bet has been settled. You lost $${loserStake}.`,
    data: { betId: _id, loss: loserStake, winner: false },
  });
}

/**
 * Settle all bets for a finished match
 */
async function settleMatchBets(matchId, matchResult) {
  const bets = await Bet.find({
    matchId,
    status: BET_STATUS.LIVE,
  });

  for (const bet of bets) {
    await settleBet(bet, matchResult);
  }
}

module.exports = { settleBet, settleMatchBets };