const User = require('../models/user');
const Bet = require('../models/Bet');
const { winRate } = require('../utils/formatters');

/**
 * Get user profile by ID or username
 */
exports.getProfile = async (userId, requesterId) => {
  const user = await User.findById(userId)
    .select('-passwordHash -refreshToken -wallet.locked -kycStatus')
    .populate('badges.badgeId');

  if (!user) throw new Error('User not found');

  // If requesting own profile, include wallet and KYC status
  if (requesterId && requesterId.toString() === userId.toString()) {
    const fullUser = await User.findById(userId)
      .select('-passwordHash -refreshToken');
    return fullUser;
  }

  return user;
};

/**
 * Update user profile
 */
exports.updateProfile = async (userId, updates) => {
  const allowedFields = ['name', 'phone', 'avatar', 'favoriteTeam', 'preferredSports', 'preferredLeagues'];
  const filtered = {};
  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key)) filtered[key] = updates[key];
  });

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: filtered },
    { new: true, runValidators: true }
  ).select('-passwordHash -refreshToken');

  return user;
};

/**
 * Update user stats after a bet settlement
 */
exports.updateStats = async (userId, betResult) => {
  // betResult: { won: boolean, profit: number }
  const user = await User.findById(userId);
  if (!user) return;

  user.stats.totalBets += 1;
  if (betResult.won) {
    user.stats.wins += 1;
    user.stats.winStreak += 1;
    user.stats.profit += betResult.profit;
  } else {
    user.stats.winStreak = 0;
    user.stats.profit -= Math.abs(betResult.profit); // if loss, profit negative
  }
  user.stats.winRate = winRate(user.stats.wins, user.stats.totalBets);
  user.stats.updatedAt = new Date();

  await user.save();
  return user.stats;
};