const User = require('../models/user');
const Bet = require('../models/Bet');
const { winRate } = require('../utils/formatters');

function fanBadgeProgress(stats = {}) {
  const streak = stats.winStreak || 0;
  const progress = Math.min(100, Math.round((streak / 10) * 100));
  return {
    name: 'Fan Badge',
    description: 'Earned after a 10-game winning streak while betting for your team',
    earned: streak >= 10,
    consecutiveWins: streak,
    requiredWins: 10,
    progress,
  };
}

/**
 * Get user profile by ID or username
 */
exports.getProfile = async (userId, requesterId) => {
  const user = await User.findById(userId)
    .select('-passwordHash -refreshToken -wallet.locked -kycStatus')
    .populate('badges.badgeId');

  if (!user) throw new Error('User not found');

  const profile = user.toObject();
  profile.fanBadge = fanBadgeProgress(user.stats);

  // If requesting own profile, include wallet and KYC status
  if (requesterId && requesterId.toString() === userId.toString()) {
    const fullUser = await User.findById(userId)
      .select('-passwordHash -refreshToken');
    const fullProfile = fullUser.toObject();
    fullProfile.fanBadge = fanBadgeProgress(fullUser.stats);
    return fullProfile;
  }

  return profile;
};

exports.getSecurityInfo = async (userId) => {
  const user = await User.findById(userId).select('email role kycStatus favoriteTeam preferredSports preferredLeagues stats badges createdAt updatedAt');
  if (!user) throw new Error('User not found');

  return {
    email: user.email,
    role: user.role,
    kycStatus: user.kycStatus,
    favoriteTeam: user.favoriteTeam,
    preferredSports: user.preferredSports,
    badgeCount: user.badges.length,
    totalBets: user.stats.totalBets,
    wins: user.stats.wins,
    winStreak: user.stats.winStreak,
    winRate: user.stats.winRate,
    fanBadge: fanBadgeProgress(user.stats),
    accountCreatedAt: user.createdAt,
    accountUpdatedAt: user.updatedAt,
    supportContact: {
      email: 'support@duelbet.com',
      message: 'Visit support for help with account security and verification',
    },
  };
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