const express = require('express');
const {
  getAllUsers,
  updateUser,
  getAllBets,
  resolveBet,
  upsertMatch,
} = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/adminMiddleware');

const router = express.Router();

// All admin routes require admin role
router.use(protect, adminOnly);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   put:
 *     summary: Update user status (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string }
 *     responses:
 *       200:
 *         description: User updated
 */
router.put('/users/:userId', updateUser);

/**
 * @swagger
 * /api/admin/bets:
 *   get:
 *     summary: Get all bets (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bets
 */
router.get('/bets', getAllBets);

/**
 * @swagger
 * /api/admin/bets/{betId}/resolve:
 *   post:
 *     summary: Manually resolve bet (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: betId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               result: { type: string }
 *     responses:
 *       200:
 *         description: Bet resolved
 */
router.post('/bets/:betId/resolve', resolveBet);

/**
 * @swagger
 * /api/admin/matches:
 *   post:
 *     summary: Create new match (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team1: { type: string }
 *               team2: { type: string }
 *               scheduledAt: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Match created
 */
router.post('/matches', upsertMatch);

/**
 * @swagger
 * /api/admin/matches/{matchId}:
 *   put:
 *     summary: Update match details (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team1: { type: string }
 *               team2: { type: string }
 *     responses:
 *       200:
 *         description: Match updated
 */
router.put('/matches/:matchId', upsertMatch);

module.exports = router;