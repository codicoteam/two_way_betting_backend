const express = require('express');
const {
  getBalance,
  deposit,
  withdraw,
  getTransactions,
} = require('../controllers/walletController');
const { protect } = require('../middlewares/authMiddleware');
const { validateDeposit, validateWithdrawal } = require('../middlewares/validationMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/wallet/balance:
 *   get:
 *     summary: Get user wallet balance
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User wallet balance
 */
router.get('/balance', protect, getBalance);

/**
 * @swagger
 * /api/wallet/deposit:
 *   post:
 *     summary: Deposit money to wallet
 *     tags: [Wallet]
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
 *         description: Deposit successful
 */
router.post('/deposit', protect, validateDeposit, deposit);

/**
 * @swagger
 * /api/wallet/withdraw:
 *   post:
 *     summary: Withdraw money from wallet
 *     tags: [Wallet]
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
 *         description: Withdrawal successful
 */
router.post('/withdraw', protect, validateWithdrawal, withdraw);

/**
 * @swagger
 * /api/wallet/transactions:
 *   get:
 *     summary: Get wallet transaction history
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get('/transactions', protect, getTransactions);

module.exports = router;