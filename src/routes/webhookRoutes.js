const express = require('express');
const { paynowWebhook, genericWebhook } = require('../controllers/webhookController');

const router = express.Router();

/**
 * @swagger
 * /api/webhooks/paynow:
 *   post:
 *     summary: Paynow payment confirmation webhook
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post('/paynow', paynowWebhook);

/**
 * @swagger
 * /api/webhooks:
 *   post:
 *     summary: Generic webhook handler
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post('/', genericWebhook);

module.exports = router;