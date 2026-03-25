const express = require('express');
const { initiateDeposit } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');
const { validateDeposit } = require('../middlewares/validationMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/payments/deposit:
 *   post:
 *     summary: Initiate Paynow deposit
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount: { type: number }
 *     responses:
 *       200:
 *         description: Payment initiated, redirect URL provided
 */
router.post('/deposit', protect, validateDeposit, initiateDeposit);

module.exports = router;