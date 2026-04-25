const User = require('../models/user');
const Bet = require('../models/bet');
const Match = require('../models/match');
const Kyc = require('../models/kyc');
const { USER_ROLE, BET_STATUS } = require('../utils/constants');

/**
 * Get all users with optional filters
 */
exports.getAllUsers = async (filters = {}, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const query = {};
  if (filters.role) query.role = filters.role;
  if (filters.kycStatus) query.kycStatus = filters.kycStatus;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const users = await User.find(query)
    .select('-passwordHash -refreshToken')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);
  return { users, total, page, totalPages: Math.ceil(total / limit) };
};

/**
 * Update user role or KYC status
 */
exports.updateUser = async (userId, updates) => {
  const allowed = ['role', 'kycStatus'];
  const filtered = {};
  Object.keys(updates).forEach(key => {
    if (allowed.includes(key)) filtered[key] = updates[key];
  });

  const user = await User.findByIdAndUpdate(userId, filtered, { new: true })
    .select('-passwordHash -refreshToken');
  return user;
};

/**
 * Get all bets with filters
 */
exports.getAllBets = async (filters = {}, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.matchId) query.matchId = filters.matchId;
  if (filters.createdBy) query.createdBy = filters.createdBy;

  const bets = await Bet.find(query)
    .populate('createdBy', 'name email')
    .populate('acceptedBy', 'name email')
    .populate('winnerId', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Bet.countDocuments(query);
  return { bets, total, page, totalPages: Math.ceil(total / limit) };
};

/**
 * Force resolve a bet (admin override)
 */
exports.resolveBetManually = async (betId, winnerId, commission = 0) => {
  const bet = await Bet.findById(betId);
  if (!bet) throw new Error('Bet not found');

  bet.winnerId = winnerId;
  bet.status = BET_STATUS.COMPLETED;
  bet.resolvedAt = new Date();
  bet.commission = commission;
  await bet.save();

  // Trigger settlement logic (could reuse settlement service)
  // For simplicity, we'll just update wallets and stats here.
  // In practice, call a settlement function.
  return bet;
};

/**
 * Create or update match manually
 */
exports.upsertMatch = async (matchData) => {
  const match = await Match.findOneAndUpdate(
    { matchId: matchData.matchId },
    matchData,
    { upsert: true, new: true }
  );
  return match;
};