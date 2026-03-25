const express = require('express');
const {
  sendMessage,
  getConversation,
  getConversations,
} = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');
const { validatePrivateMessage } = require('../middlewares/validationMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Send private message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientId: { type: string }
 *               message: { type: string }
 *     responses:
 *       200:
 *         description: Message sent
 */
router.post('/', protect, validatePrivateMessage, sendMessage);

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Get all message conversations
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 */
router.get('/conversations', protect, getConversations);

/**
 * @swagger
 * /api/messages/conversation/{userId}:
 *   get:
 *     summary: Get messages with specific user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Conversation history
 */
router.get('/conversation/:userId', protect, getConversation);

module.exports = router;