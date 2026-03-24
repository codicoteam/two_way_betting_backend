const paymentService = require('../services/paymentService');

exports.initiateDeposit = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const result = await paymentService.initiateDeposit(req.user.id, amount, req.user.email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};