const express = require('express');
const {
  createBet,
  acceptBet,
  getBets,
  getBetById,
  getMatchBets,
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

/**
 * @swagger
 * /api/bets:
 *   post:
 *     summary: Create a new bet
 *     tags: [Bets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matchId
 *               - marketType
 *               - creatorPrediction
 *               - odds
 *               - creatorStake
 *             properties:
 *               matchId: { type: string, description: "ID of the match to bet on" }
 *               marketType: { type: string, enum: ["match_result", "goals", "cards"], description: "Type of betting market" }
 *               creatorPrediction: { type: string, description: "Your prediction (e.g., 'home', 'draw', 'away' for match_result)" }
 *               odds: { type: number, minimum: 1.01, description: "Odds offered (minimum 1.01)" }
 *               creatorStake: { type: number, minimum: 1, description: "Amount you are staking" }
 *     responses:
 *       201:
 *         description: Bet created successfully
 *   get:
 *     summary: Get user's bets
 *     tags: [Bets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's bets
 */
router.post('/', protect, createBetLimiter, validateCreateBet, createBet);
router.get('/', protect, getBets);

/**
 * @swagger
 * /api/bets/match/{matchId}:
 *   get:
 *     summary: Get bets for a match
 *     tags: [Bets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of bets for the supplied match
 */
router.get('/match/:matchId', protect, getMatchBets);

/**
 * @swagger
 * /api/bets/{id}:
 *   get:
 *     summary: Get bet by ID
 *     tags: [Bets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Bet details
 */
router.get('/:id', protect, getBetById);

/**
 * @swagger
 * /api/bets/{betId}/accept:
 *   post:
 *     summary: Accept a bet
 *     tags: [Bets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: betId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Bet accepted
 */
router.post('/:betId/accept', protect, validateAcceptBet, acceptBet);

/**
 * @swagger
 * /api/bets/{betId}/accept-requests:
 *   get:
 *     summary: Get accept requests for a bet
 *     tags: [Bets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: betId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of accept requests
 */
router.get('/:betId/accept-requests', protect, getAcceptRequests);

/**
 * @swagger
 * /api/bets/{betId}/choose-opponent:
 *   post:
 *     summary: Choose opponent for a bet
 *     tags: [Bets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: betId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Opponent chosen
 */
router.post('/:betId/choose-opponent', protect, validateSelectOpponent, chooseOpponent);

/**
 * @swagger
 * /api/bets/{betId}/early-settlement/request:
 *   post:
 *     summary: Request early settlement
 *     tags: [Bets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: betId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Settlement requested
 */
router.post('/:betId/early-settlement/request', protect, validateEarlySettlement, requestEarlySettlement);

/**
 * @swagger
 * /api/bets/{betId}/early-settlement/respond:
 *   post:
 *     summary: Respond to early settlement request
 *     tags: [Bets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: betId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Settlement response recorded
 */
router.post('/:betId/early-settlement/respond', protect, respondEarlySettlement);

module.exports = router;