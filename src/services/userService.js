const User = require('../models/user');
const Bet = require('../models/bet');
const Match = require('../models/match');
const notificationService = require('./notificationService');
const { NOTIFICATION_TYPE } = require('../utils/constants');
const { winRate } = require('../utils/formatters');

async function bigFanBadgeProgress(user) {
  const favoriteTeam = user.favoriteTeam;
  if (!favoriteTeam) {
    return {
      name: 'Big Fan Badge',
      description: 'Select your favorite team and bet on them 10 times to earn this badge.',
      earned: false,
      betCount: 0,
      requiredBets: 10,
      progress: 0,
    };
  }

  const bets = await Bet.find({ createdBy: user._id }).select('matchId creatorPrediction');
  const matchIds = bets.map((bet) => bet.matchId);
  const matches = await Match.find({ matchId: { $in: matchIds } }).select('matchId homeTeam.name awayTeam.name');
  const matchMap = matches.reduce((map, match) => {
    map[match.matchId] = match;
    return map;
  }, {});

  const count = bets.reduce((total, bet) => {
    const match = matchMap[bet.matchId];
    if (!match) return total;
    if (bet.creatorPrediction === 'home' && match.homeTeam.name === favoriteTeam) return total + 1;
    if (bet.creatorPrediction === 'away' && match.awayTeam.name === favoriteTeam) return total + 1;
    return total;
  }, 0);

  const progress = Math.min(100, Math.round((count / 10) * 100));
  return {
    name: 'Big Fan Badge',
    description: 'Bet on your favorite team 10 times to earn this badge.',
    earned: count >= 10,
    betCount: count,
    requiredBets: 10,
    progress,
  };
}

/**
 * Get user profile by ID or username
 */
exports.getProfile = async (userId, requesterId) => {
  const user = await User.findById(userId)
    .select('-passwordHash -refreshToken -wallet.locked')
    .populate('badges.badgeId');

  if (!user) throw new Error('User not found');

  const profile = user.toObject();
  profile.verified = user.kycStatus === 'verified';
  delete profile.kycStatus;
  profile.bigFanBadge = await bigFanBadgeProgress(user);

  // If requesting own profile, include wallet and KYC status
  if (requesterId && requesterId.toString() === userId.toString()) {
    const fullUser = await User.findById(userId)
      .select('-passwordHash -refreshToken');
    const fullProfile = fullUser.toObject();
    fullProfile.bigFanBadge = await bigFanBadgeProgress(fullUser);
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
    bigFanBadge: await bigFanBadgeProgress(user),
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

  const oldWins = user.stats.wins;

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

  if (betResult.won && betResult.profit >= 50) {
    await notificationService.create({
      userId,
      type: NOTIFICATION_TYPE.SYSTEM_ALERT,
      title: 'Profit milestone',
      message: `Nice! You earned $${betResult.profit} profit from this bet.`,
      data: {},
    });
  }

  if (betResult.won && user.stats.winStreak === 5) {
    await notificationService.create({
      userId,
      type: NOTIFICATION_TYPE.SYSTEM_ALERT,
      title: 'Winning streak!',
      message: 'You have won 5 matches in a row. Keep the streak going!',
      data: {},
    });
  }

  if (oldWins < 10 && user.stats.wins >= 10) {
    await notificationService.create({
      userId,
      type: NOTIFICATION_TYPE.SYSTEM_ALERT,
      title: '10 Match Wins',
      message: 'Congratulations! You have won 10 matches.',
      data: {},
    });
  }

  return user.stats;
};