const express = require('express');
const {
  sendMessage,
  getConversation,
  getConversations,
} = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');
const { validatePrivateMessage } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.post('/', protect, validatePrivateMessage, sendMessage);
router.get('/conversations', protect, getConversations);
router.get('/conversation/:userId', protect, getConversation);

module.exports = router;