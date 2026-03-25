const express = require('express');
const { postMessage, getMessages } = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');
const { validateChatMessage } = require('../middlewares/validationMiddleware');
const { chatLimiter } = require('../middlewares/rateLimitMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/chat/match/{matchId}:
 *   post:
 *     summary: Post message in match chat
 *     tags: [Chat]
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
 *               message: { type: string }
 *     responses:
 *       200:
 *         description: Message posted
 *   get:
 *     summary: Get match chat messages
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of chat messages
 */
router.post('/match/:matchId', protect, chatLimiter, validateChatMessage, postMessage);
router.get('/match/:matchId', protect, getMessages);

module.exports = router;