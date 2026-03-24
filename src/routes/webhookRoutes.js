const express = require('express');
const { paynowWebhook, genericWebhook } = require('../controllers/webhookController');

const router = express.Router();

// Paynow sends POST to this endpoint
router.post('/paynow', paynowWebhook);

// Generic webhook receiver (if needed)
router.post('/', genericWebhook);

module.exports = router;