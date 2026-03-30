const express = require('express');
const { getProfile, updateProfile, getSecurityInfo } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { validateUpdateProfile } = require('../middlewares/validationMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
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
 *               avatar: { type: string }
 *               phone: { type: string }
 *               favoriteTeam: { type: string }
 *               preferredSports: { type: array, items: { type: string } }
 *               preferredLeagues: { type: array, items: { type: string }, maxItems: 5 }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validateUpdateProfile, updateProfile);

/**
 * @swagger
 * /api/users/security:
 *   get:
 *     summary: Get security information for the current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security data for the current user
 */
router.get('/security', protect, getSecurityInfo);

/**
 * @swagger
 * /api/users/profile/{userId}:
 *   get:
 *     summary: Get other user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User profile data
 */
router.get('/profile/:userId', protect, getProfile);

module.exports = router;