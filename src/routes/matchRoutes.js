const express = require('express');
const {
  getUpcomingMatches,
  getLiveMatches,
  getMatchById,
  getMatchOverview,
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