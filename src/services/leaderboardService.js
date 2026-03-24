const User = require('../models/user');
const { LEADERBOARD_PERIOD } = require('../utils/constants');

/**
 * Get top users by profit (or other metric) for a given period
 */
exports.getLeaderboard = async (metric = 'profit', period = LEADERBOARD_PERIOD.ALL_TIME, limit = 10) => {
  // Build date filter based on period
  let dateFilter = {};
  if (period !== LEADERBOARD_PERIOD.ALL_TIME) {
    const now = new Date();
    if (period === LEADERBOARD_PERIOD.DAILY) {
      dateFilter = { $gte: new Date(now.setHours(0,0,0,0)) };
    } else if (period === LEADERBOARD_PERIOD.WEEKLY) {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      dateFilter = { $gte: weekAgo };
    } else if (period === LEADERBOARD_PERIOD.MONTHLY) {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      dateFilter = { $gte: monthAgo };
    }
  }

  // For profit, we need to aggregate from Transaction or use cached stats
  // Using cached stats is simpler for MVP
  const sortField = metric === 'profit' ? 'stats.profit' : 
                     metric === 'wins' ? 'stats.wins' : 
                     metric === 'winRate' ? 'stats.winRate' : 'stats.profit';

  const users = await User.find({ role: 'user' })
    .select('name avatar stats favoriteTeam')
    .sort({ [sortField]: -1 })
    .limit(limit);

  return users.map(u => ({
    id: u._id,
    name: u.name,
    avatar: u.avatar,
    favoriteTeam: u.favoriteTeam,
    profit: u.stats.profit,
    wins: u.stats.wins,
    winRate: u.stats.winRate,
    totalBets: u.stats.totalBets,
    winStreak: u.stats.winStreak,
  }));
};

/**
 * Get user's rank
 */
exports.getUserRank = async (userId, metric = 'profit') => {
  const users = await User.find({ role: 'user' }).sort({ [`stats.${metric}`]: -1 });
  const index = users.findIndex(u => u._id.toString() === userId.toString());
  return index + 1; // 1-based rank
};