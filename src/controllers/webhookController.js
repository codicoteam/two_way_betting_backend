const paymentService = require('../services/paymentService');
const logger = require('../utils/logger');

exports.paynowWebhook = async (req, res, next) => {
  try {
    await paymentService.handleWebhook(req.body);
    res.status(200).send('OK');
  } catch (error) {
    logger.error('Paynow webhook error:', error);
    res.status(200).send('OK');
  }
};

exports.genericWebhook = async (req, res, next) => {
  try {
    const provider = req.query.provider || req.body.provider;
    if (provider === 'paynow') {
      await paymentService.handleWebhook(req.body);
    }
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};