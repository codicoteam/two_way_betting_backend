const env = require('./env');

module.exports = {
  integrationId: env.PAYNOW_INTEGRATION_ID,
  integrationKey: env.PAYNOW_INTEGRATION_KEY,
  returnUrl: env.PAYNOW_RETURN_URL,
  resultUrl: env.PAYNOW_RESULT_URL,
  currency: 'USD',
};