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

router.get('/balance', protect, getBalance);
router.post('/deposit', protect, validateDeposit, deposit);
router.post('/withdraw', protect, validateWithdrawal, withdraw);
router.get('/transactions', protect, getTransactions);

module.exports = router;