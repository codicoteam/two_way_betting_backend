const User = require('../models/user');
const Transaction = require('../models/Transaction');
const { TRANSACTION_TYPE } = require('../utils/constants');

/**
 * Get wallet balance
 */
exports.getBalance = async (userId) => {
  const user = await User.findById(userId).select('wallet');
  return user.wallet;
};

/**
 * Lock funds (when bet is created/accepted)
 */
exports.lockFunds = async (userId, amount, betId) => {
  const user = await User.findById(userId);
  if (user.wallet.available < amount) {
    throw new Error('Insufficient funds');
  }

  user.wallet.available -= amount;
  user.wallet.locked += amount;
  await user.save();

  // Record transaction
  await Transaction.create({
    userId,
    type: TRANSACTION_TYPE.BET_LOCK,
    amount,
    status: 'completed',
    betId,
    description: `Locked ${amount} for bet ${betId}`,
  });

  return user.wallet;
};

/**
 * Release locked funds (when bet is settled)
 */
exports.releaseFunds = async (userId, amount, betId, type = TRANSACTION_TYPE.BET_RELEASE) => {
  const user = await User.findById(userId);
  user.wallet.locked -= amount;
  // For win, we add to available; for loss, we just remove from locked (no addition)
  if (type === TRANSACTION_TYPE.BET_WIN) {
    user.wallet.available += amount;
  }
  await user.save();

  await Transaction.create({
    userId,
    type,
    amount,
    status: 'completed',
    betId,
    description: `${type === 'bet_win' ? 'Winnings' : 'Released'} ${amount} from bet ${betId}`,
  });

  return user.wallet;
};

/**
 * Add funds (deposit)
 */
exports.deposit = async (userId, amount, reference) => {
  const user = await User.findById(userId);
  user.wallet.available += amount;
  await user.save();

  await Transaction.create({
    userId,
    type: TRANSACTION_TYPE.DEPOSIT,
    amount,
    status: 'completed',
    reference,
    description: `Deposit of ${amount}`,
  });

  return user.wallet;
};

/**
 * Withdraw funds
 */
exports.withdraw = async (userId, amount, reference) => {
  const user = await User.findById(userId);
  if (user.wallet.available < amount) {
    throw new Error('Insufficient available balance');
  }

  user.wallet.available -= amount;
  await user.save();

  await Transaction.create({
    userId,
    type: TRANSACTION_TYPE.WITHDRAWAL,
    amount,
    status: 'completed',
    reference,
    description: `Withdrawal of ${amount}`,
  });

  return user.wallet;
};

/**
 * Get transaction history
 */
exports.getTransactions = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const transactions = await Transaction.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Transaction.countDocuments({ userId });

  return { transactions, total, page, totalPages: Math.ceil(total / limit) };
};