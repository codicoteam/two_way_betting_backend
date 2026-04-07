const walletService = require('../services/walletService');
const paymentService = require('../services/paymentService');

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
  const { amount, phone, method } = req.body;
  const reference = `WIT_${req.user.id}_${Date.now()}`;
  const payoutPhone = phone || req.user.phone;
  let reserved = false;

  if (!payoutPhone) {
    return res.status(400).json({ success: false, message: 'Withdrawal phone number is required.' });
  }

  try {
    const wallet = await walletService.reserveWithdrawal(req.user.id, amount, reference, { phone: payoutPhone, method });
    reserved = true;
    const payoutResult = await paymentService.initiateWithdrawal(req.user, amount, payoutPhone, method, reference);
    res.json({ success: true, data: { reference, wallet, payment: payoutResult } });
  } catch (error) {
    if (reserved) {
      await walletService.failWithdrawal(reference, error.message || 'Withdrawal initiation failed');
    }
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