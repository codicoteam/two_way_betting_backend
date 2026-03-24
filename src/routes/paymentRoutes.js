const express = require('express');
const { initiateDeposit } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');
const { validateDeposit } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.post('/deposit', protect, validateDeposit, initiateDeposit);

module.exports = router;