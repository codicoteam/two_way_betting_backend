const express = require('express');
const { getLeaderboard, getUserRank } = require('../controllers/leaderboardController');
const { protect, optional } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/leaderboard:
 *   get:
 *     summary: Get leaderboard
 *     tags: [Leaderboard]
 *     responses:
 *       200:
 *         description: Leaderboard data
 */
router.get('/', optional, getLeaderboard);

/**
 * @swagger
 * /api/leaderboard/rank:
 *   get:
 *     summary: Get current user rank
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User rank and stats
 */
router.get('/rank', optional, getUserRank);

/**
 * @swagger
 * /api/leaderboard/rank/{userId}:
 *   get:
 *     summary: Get specific user rank
 *     tags: [Leaderboard]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User rank and stats
 */
router.get('/rank/:userId', optional, getUserRank);

module.exports = router;