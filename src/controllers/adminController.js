const adminService = require('../services/adminService');
const auditService = require('../services/auditService');

exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      role: req.query.role,
      kycStatus: req.query.kycStatus,
      search: req.query.search,
    };
    const result = await adminService.getAllUsers(filters, page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const updated = await adminService.updateUser(userId, req.body);
    await auditService.log({
      adminId: req.user.id,
      action: 'UPDATE_USER',
      targetType: 'user',
      targetId: userId,
      newData: req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

exports.getAllBets = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filters = {
      status: req.query.status,
      matchId: req.query.matchId,
      createdBy: req.query.createdBy,
    };
    const result = await adminService.getAllBets(filters, page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.resolveBet = async (req, res, next) => {
  try {
    const { betId } = req.params;
    const { winnerId, commission } = req.body;
    const bet = await adminService.resolveBetManually(betId, winnerId, commission);
    await auditService.log({
      adminId: req.user.id,
      action: 'RESOLVE_BET',
      targetType: 'bet',
      targetId: betId,
      newData: { winnerId, commission },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });
    res.json({ success: true, data: bet });
  } catch (error) {
    next(error);
  }
};

exports.upsertMatch = async (req, res, next) => {
  try {
    const match = await adminService.upsertMatch(req.body);
    await auditService.log({
      adminId: req.user.id,
      action: 'UPSERT_MATCH',
      targetType: 'match',
      targetId: match.matchId,
      newData: req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });
    res.json({ success: true, data: match });
  } catch (error) {
    next(error);
  }
};