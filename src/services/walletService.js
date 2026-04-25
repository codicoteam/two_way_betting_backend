const User = require('../models/user');
const Transaction = require('../models/transaction');
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
  if (user.wallet.locked < 0) {
    user.wallet.locked = 0;
  }
  // Refunds and wins add to available
  if (type === TRANSACTION_TYPE.BET_WIN || type === TRANSACTION_TYPE.REFUND) {
    user.wallet.available += amount;
  }
  await user.save();

  await Transaction.create({
    userId,
    type,
    amount,
    status: 'completed',
    betId,
    description: `${type === TRANSACTION_TYPE.BET_WIN ? 'Winnings' : type === TRANSACTION_TYPE.REFUND ? 'Refund' : 'Released'} ${amount} from bet ${betId}`,
  });

  return user.wallet;
};

exports.settleLockedFunds = async (userId, lockedAmount, returnedAmount, betId, type, description) => {
  const user = await User.findById(userId);
  user.wallet.locked -= lockedAmount;
  if (user.wallet.locked < 0) {
    user.wallet.locked = 0;
  }
  if (returnedAmount > 0) {
    user.wallet.available += returnedAmount;
  }
  await user.save();

  await Transaction.create({
    userId,
    type,
    amount: returnedAmount,
    status: 'completed',
    betId,
    description,
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

exports.reserveWithdrawal = async (userId, amount, reference, destination = {}) => {
  const user = await User.findById(userId);
  if (user.wallet.available < amount) {
    throw new Error('Insufficient available balance');
  }

  user.wallet.available -= amount;
  user.wallet.locked += amount;
  await user.save();

  await Transaction.create({
    userId,
    type: TRANSACTION_TYPE.WITHDRAWAL,
    amount,
    status: 'pending',
    reference,
    description: `Withdrawal of ${amount}`,
    metadata: {
      ...destination,
      initiatedAt: new Date(),
    },
  });

  return user.wallet;
};

exports.completeWithdrawal = async (reference, paynowReference) => {
  const transaction = await Transaction.findOne({ reference });
  if (!transaction) {
    throw new Error('Withdrawal transaction not found');
  }

  if (transaction.status === 'completed') {
    return transaction;
  }

  const user = await User.findById(transaction.userId);
  user.wallet.locked -= transaction.amount;
  if (user.wallet.locked < 0) {
    user.wallet.locked = 0;
  }
  await user.save();

  transaction.status = 'completed';
  transaction.metadata = {
    ...transaction.metadata,
    paynowReference,
    completedAt: new Date(),
  };
  await transaction.save();

  return transaction;
};

exports.failWithdrawal = async (reference, errorMessage) => {
  const transaction = await Transaction.findOne({ reference });
  if (!transaction) {
    throw new Error('Withdrawal transaction not found');
  }

  if (transaction.status === 'failed') {
    return transaction;
  }

  const user = await User.findById(transaction.userId);
  user.wallet.locked -= transaction.amount;
  if (user.wallet.locked < 0) {
    user.wallet.locked = 0;
  }
  user.wallet.available += transaction.amount;
  await user.save();

  transaction.status = 'failed';
  transaction.metadata = {
    ...transaction.metadata,
    error: errorMessage,
    failedAt: new Date(),
  };
  await transaction.save();

  return transaction;
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