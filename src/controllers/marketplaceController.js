const marketplaceService = require('../services/marketplaceService');

exports.getOpenBetsForMatch = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const bets = await marketplaceService.getOpenBetsForMatch(matchId);
    res.json({ success: true, data: bets });
  } catch (error) {
    next(error);
  }
};