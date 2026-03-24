const leaderboardService = require('../services/leaderboardService');

exports.getLeaderboard = async (req, res, next) => {
  try {
    const metric = req.query.metric || 'profit';
    const period = req.query.period || 'all_time';
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await leaderboardService.getLeaderboard(metric, period, limit);
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    next(error);
  }
};

exports.getUserRank = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id;
    const metric = req.query.metric || 'profit';
    const rank = await leaderboardService.getUserRank(userId, metric);
    res.json({ success: true, data: { rank } });
  } catch (error) {
    next(error);
  }
};