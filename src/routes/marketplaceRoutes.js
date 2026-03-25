const express = require('express');
const { getOpenBetsForMatch } = require('../controllers/marketplaceController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/marketplace/match/{matchId}:
 *   get:
 *     summary: Get open bets for a match
 *     tags: [Marketplace]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of open bets available for this match
 */
router.get('/match/:matchId', protect, getOpenBetsForMatch);

module.exports = router;