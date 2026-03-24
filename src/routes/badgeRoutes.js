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

router.get('/', protect, getAllBadges);
router.get('/user/:userId', protect, getUserBadges);
router.post('/check-award', protect, checkAndAward); // trigger badge check for current user

// Admin only
router.post('/', protect, adminOnly, createBadge);

module.exports = router;