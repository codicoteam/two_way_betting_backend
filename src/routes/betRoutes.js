const express = require('express');
const {
  createBet,
  acceptBet,
  getBets,
  getBetById,
  requestEarlySettlement,
  respondEarlySettlement,
  getAcceptRequests,
  chooseOpponent,
} = require('../controllers/betController');
const { protect } = require('../middlewares/authMiddleware');
const {
  validateCreateBet,
  validateAcceptBet,
  validateSelectOpponent,
  validateEarlySettlement,
} = require('../middlewares/validationMiddleware');
const { createBetLimiter } = require('../middlewares/rateLimitMiddleware');

const router = express.Router();

router.post('/', protect, createBetLimiter, validateCreateBet, createBet);
router.post('/:betId/accept', protect, validateAcceptBet, acceptBet);
router.get('/:betId/accept-requests', protect, getAcceptRequests);
router.post('/:betId/choose-opponent', protect, validateSelectOpponent, chooseOpponent);
router.get('/', protect, getBets);
router.get('/:id', protect, getBetById);
router.post('/:betId/early-settlement/request', protect, validateEarlySettlement, requestEarlySettlement);
router.post('/:betId/early-settlement/respond', protect, respondEarlySettlement);

module.exports = router;