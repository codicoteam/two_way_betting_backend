const userService = require('../services/userService');

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id;
    const profile = await userService.getProfile(userId, req.user?.id);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

exports.getSecurityInfo = async (req, res, next) => {
  try {
    const securityInfo = await userService.getSecurityInfo(req.user.id);
    res.json({ success: true, data: securityInfo });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updated = await userService.updateProfile(req.user.id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};