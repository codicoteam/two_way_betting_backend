const crypto = require('crypto');
const env = require('../configs/env');

/**
 * Verify Paynow webhook signature
 * Paynow sends a hash in the 'hash' parameter.
 * The hash is computed as: IntegrationKey + pollurl + status + amount + reference + paynowreference
 * But according to Paynow documentation, the exact fields may vary. This is a simplified version.
 */
const verifyPaynowWebhook = (body) => {
  const { hash, ...data } = body;

  // Construct the string to hash according to Paynow spec (order may differ)
  // Usually: IntegrationKey + pollurl + status + amount + reference + paynowreference
  const stringToHash = `${env.PAYNOW_INTEGRATION_KEY}${data.pollurl || ''}${data.status || ''}${data.amount || ''}${data.reference || ''}${data.paynowreference || ''}`;

  const computedHash = crypto.createHash('sha512').update(stringToHash).digest('hex').toUpperCase();

  return computedHash === hash;
};

// Generic webhook signature verifier for other services (if needed)
const createSignatureVerifier = (secret, algorithm = 'sha256') => {
  return (payload, signature) => {
    const computed = crypto.createHmac(algorithm, secret).update(JSON.stringify(payload)).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
  };
};

module.exports = {
  verifyPaynowWebhook,
  createSignatureVerifier,
};