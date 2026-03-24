const walletService = require('../services/walletService');

exports.getBalance = async (req, res, next) => {
  try {
    const balance = await walletService.getBalance(req.user.id);
    res.json({ success: true, data: balance });
  } catch (error) {
    next(error);
  }
};

exports.deposit = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const reference = `DEP_${Date.now()}`;
    const wallet = await walletService.deposit(req.user.id, amount, reference);
    res.json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
};

exports.withdraw = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const reference = `WIT_${Date.now()}`;
    const wallet = await walletService.withdraw(req.user.id, amount, reference);
    res.json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await walletService.getTransactions(req.user.id, page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};