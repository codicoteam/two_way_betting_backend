const Badge = require('../models/Badge');
const User = require('../models/user');

/**
 * Check and award badges for a user based on their stats
 */
exports.checkAndAwardBadges = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const allBadges = await Badge.find();
  const earnedBadgeIds = user.badges.map(b => b.badgeId.toString());

  const newlyEarned = [];

  for (const badge of allBadges) {
    if (earnedBadgeIds.includes(badge._id.toString())) continue;

    let earned = false;
    const { criteria } = badge;

    switch (criteria.type) {
      case 'wins':
        if (user.stats.wins >= criteria.threshold) earned = true;
        break;
      case 'streak':
        if (user.stats.winStreak >= criteria.threshold) earned = true;
        break;
      case 'bets_on_team':
        // Count bets on a specific team – need to query Bet collection
        const count = await Bet.countDocuments({
          createdBy: userId,
          'resultData.finalOutcome': criteria.teamId, // adjust as needed
        });
        if (count >= criteria.threshold) earned = true;
        break;
      case 'profit_amount':
        if (user.stats.profit >= criteria.threshold) earned = true;
        break;
      case 'referrals':
        // Assuming referral model tracks referred users
        const referredCount = await User.countDocuments({ referredBy: userId });
        if (referredCount >= criteria.threshold) earned = true;
        break;
      default:
        break;
    }

    if (earned) {
      user.badges.push({ badgeId: badge._id, earnedAt: new Date() });
      newlyEarned.push(badge);
    }
  }

  if (newlyEarned.length > 0) {
    await user.save();
  }

  return newlyEarned;
};

/**
 * Get all badges (for admin)
 */
exports.getAllBadges = async () => {
  return Badge.find().sort({ category: 1, name: 1 });
};

/**
 * Create a new badge (admin only)
 */
exports.createBadge = async (badgeData) => {
  const badge = await Badge.create(badgeData);
  return badge;
};