const express = require('express');
const {
  getAvailableSports,
  getAvailableLeagues,
  getUserPreferences,
  updateUserPreferences
} = require('../controllers/preferencesController');
const { protect, optional } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/preferences/sports:
 *   get:
 *     summary: Get available sports
 *     tags: [Preferences]
 *     responses:
 *       200:
 *         description: List of available sports
 */
router.get('/sports', getAvailableSports);

/**
 * @swagger
 * /api/preferences/leagues:
 *   get:
 *     summary: Get available leagues
 *     tags: [Preferences]
 *     responses:
 *       200:
 *         description: List of available leagues from upcoming matches
 */
router.get('/leagues', getAvailableLeagues);

/**
 * @swagger
 * /api/preferences/my-preferences:
 *   get:
 *     summary: Get current user's preferences
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's preferred sports and leagues
 */
router.get('/my-preferences', protect, getUserPreferences);

/**
 * @swagger
 * /api/preferences/my-preferences:
 *   put:
 *     summary: Update user's preferences
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferredSports: { type: array, items: { type: string } }
 *               preferredLeagues: { type: array, items: { type: string }, maxItems: 5 }
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */
router.put('/my-preferences', protect, updateUserPreferences);

module.exports = router;
