const badgeService = require('../services/badgeService');
const User = require('../models/user');

exports.getAllBadges = async (req, res, next) => {
  try {
    const badges = await badgeService.getAllBadges();
    res.json({ success: true, data: badges });
  } catch (error) {
    next(error);
  }
};

exports.createBadge = async (req, res, next) => {
  try {
    const badge = await badgeService.createBadge(req.body);
    res.status(201).json({ success: true, data: badge });
  } catch (error) {
    next(error);
  }
};

exports.getUserBadges = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('badges.badgeId');
    res.json({ success: true, data: user?.badges || [] });
  } catch (error) {
    next(error);
  }
};

exports.checkAndAward = async (req, res, next) => {
  try {
    const newlyEarned = await badgeService.checkAndAwardBadges(req.user.id);
    res.json({ success: true, data: newlyEarned });
  } catch (error) {
    next(error);
  }
};