const paymentService = require('../services/paymentService');
const walletService = require('../services/walletService');

exports.initiateDeposit = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const result = await paymentService.initiateDeposit(req.user.id, amount, req.user.email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.initiateWithdrawal = async (req, res, next) => {
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