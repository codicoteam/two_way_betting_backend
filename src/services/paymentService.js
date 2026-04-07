const axios = require('axios');
const crypto = require('crypto');
const qs = require('qs');
const { Paynow } = require('paynow');
const env = require('../configs/env');
const paymentsConfig = require('../configs/payments');
const Transaction = require('../models/Transaction');
const walletService = require('./walletService');
const logger = require('../utils/logger');

const PAYNOW_URL = 'https://www.paynow.co.zw/interface/initiatetransaction';
const PAYNOW_RESULT_URL = env.PAYNOW_RESULT_URL;
const PAYNOW_RETURN_URL = env.PAYNOW_RETURN_URL;

/**
 * Initiate a deposit via Paynow
 */
exports.initiateDeposit = async (userId, amount, email) => {
  const reference = `DEPOSIT_${userId}_${Date.now()}`;

  const params = {
    id: env.PAYNOW_INTEGRATION_ID,
    reference,
    amount,
    currency: 'USD',
    returnurl: PAYNOW_RETURN_URL,
    resulturl: PAYNOW_RESULT_URL,
    additionalinfo: `Deposit for user ${userId}`,
    authemail: email,
    status: 'Message',
  };

  // Generate hash (Paynow requires hash of sorted parameters)
  const hash = generatePaynowHash(params, env.PAYNOW_INTEGRATION_KEY);
  params.hash = hash;

  try {
    const response = await axios.post(PAYNOW_URL, qs.stringify(params), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    // Parse response (Paynow returns URL-encoded string)
    const parsed = qs.parse(response.data);
    if (parsed.status !== 'Ok') {
      throw new Error(parsed.error || 'Paynow initiation failed');
    }

    // Create transaction record
    await Transaction.create({
      userId,
      type: 'deposit',
      amount,
      status: 'pending',
      reference,
      metadata: { pollurl: parsed.pollurl, browserurl: parsed.browserurl },
    });

    return {
      success: true,
      pollUrl: parsed.pollurl,
      browserUrl: parsed.browserurl,
      reference,
    };
  } catch (error) {
    logger.error('Paynow initiation error:', error);
    throw new Error('Payment initiation failed');
  }
};

exports.initiateWithdrawal = async (user, amount, phone, method = 'ecocash', reference) => {
  const paynow = new Paynow(
    paymentsConfig.integrationId,
    paymentsConfig.integrationKey,
    paymentsConfig.resultUrl,
    paymentsConfig.returnUrl
  );

  const payment = paynow.createPayment(reference, user.email || 'no-reply@duelbet.com');
  payment.add('Withdrawal payout', amount);

  const response = await paynow.sendMobile(payment, phone, method);
  if (!response || !response.success) {
    throw new Error(response?.error || 'Paynow withdrawal initiation failed');
  }

  return {
    success: true,
    pollUrl: response.pollUrl,
    instructions: response.instructions,
    status: 'pending',
    reference,
  };
};

/**
 * Handle Paynow result notification (webhook)
 */
exports.handleWebhook = async (body) => {
  // Verify hash
  const hash = body.hash;
  delete body.hash;
  const calculatedHash = generatePaynowHash(body, env.PAYNOW_INTEGRATION_KEY);
  if (hash !== calculatedHash) {
    throw new Error('Invalid signature');
  }

  const { reference, status, amount, paynowreference } = body;

  // Find transaction
  const transaction = await Transaction.findOne({ reference });
  if (!transaction) throw new Error('Transaction not found');

  if (transaction.type === 'withdrawal') {
    if (status === 'Paid') {
      await walletService.completeWithdrawal(reference, paynowreference);
    } else {
      await walletService.failWithdrawal(reference, body.error || status);
    }

    return { received: true };
  }

  if (status === 'Paid') {
    // Update transaction
    transaction.status = 'completed';
    transaction.metadata.paynowReference = paynowreference;
    await transaction.save();

    // Credit user wallet
    await walletService.deposit(transaction.userId, parseFloat(amount), reference);
  } else {
    transaction.status = 'failed';
    transaction.metadata.error = body.error || status;
    await transaction.save();
  }

  return { received: true };
};

// Helper to generate Paynow hash
function generatePaynowHash(params, key) {
  const keys = Object.keys(params).sort();
  const values = keys.map(k => params[k]).join('');
  return crypto.createHash('sha512').update(values + key).digest('hex').toUpperCase();
}