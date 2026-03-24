const express = require('express');
const { postMessage, getMessages } = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');
const { validateChatMessage } = require('../middlewares/validationMiddleware');
const { chatLimiter } = require('../middlewares/rateLimitMiddleware');

const router = express.Router();

router.post('/match/:matchId', protect, chatLimiter, validateChatMessage, postMessage);
router.get('/match/:matchId', protect, getMessages);

module.exports = router;