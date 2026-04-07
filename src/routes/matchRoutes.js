const express = require('express');
const {
  getUpcomingMatches,
  getLiveMatches,
  getMatchById,
  getMatchOverview,
  getMatchParticipants,
  getOddsSuggestion,
  refreshMatches,
} = require('../controllers/matchController');
const { protect, optional } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/adminMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/matches/upcoming:
 *   get:
 *     summary: Get upcoming matches
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: List of upcoming matches
 */
router.get('/upcoming', optional, getUpcomingMatches);

/**
 * @swagger
 * /api/matches/live:
 *   get:
 *     summary: Get live matches
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: List of live matches
 */
router.get('/live', optional, getLiveMatches);

/**
 * @swagger
 * /api/matches/{id}/overview:
 *   get:
 *     summary: Get detailed match overview with chat and stakes
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Match detail including chat and stakes
 */
router.get('/:id/overview', optional, getMatchOverview);
/**
 * @swagger
 * /api/matches/{id}/odds-suggestion:
 *   get:
 *     summary: Get suggested odds for a match and prediction
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: prediction
 *         required: false
 *         schema:
 *           type: string
 *           enum: [home, away, draw]
 *         description: Prediction to calculate suggested odds for
 *     responses:
 *       200:
 *         description: Suggested odds
 */
router.get('/:id/odds-suggestion', optional, getOddsSuggestion);
/**
 * @swagger
 * /api/matches/{id}/participants:
 *   get:
 *     summary: Get match participant profiles
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of participant profiles for the match
 */
router.get('/:id/participants', protect, getMatchParticipants);

/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Get match by ID
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Match details
 */
router.get('/:id', optional, getMatchById);

/**
 * @swagger
 * /api/matches/refresh:
 *   post:
 *     summary: Refresh match data (admin only)
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Matches refreshed
 */
router.post('/refresh', protect, adminOnly, refreshMatches);

module.exports = router;