const express = require('express');
const {
  getAllBadges,
  createBadge,
  getUserBadges,
  checkAndAward,
} = require('../controllers/badgeController');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/adminMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/badges:
 *   get:
 *     summary: Get all available badges
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all badges
 *   post:
 *     summary: Create new badge (admin only)
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Badge created
 */
router.get('/', protect, getAllBadges);
router.post('/', protect, adminOnly, createBadge);

/**
 * @swagger
 * /api/badges/user/{userId}:
 *   get:
 *     summary: Get user's badges
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of user's earned badges
 */
router.get('/user/:userId', protect, getUserBadges);

/**
 * @swagger
 * /api/badges/check-award:
 *   post:
 *     summary: Check for new badge eligibility
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Badge check result
 */
router.post('/check-award', protect, checkAndAward);

module.exports = router;