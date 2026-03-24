const express = require('express');
const { getLeaderboard, getUserRank } = require('../controllers/leaderboardController');
const { protect, optional } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', optional, getLeaderboard);
router.get('/rank', optional, getUserRank); // current user
router.get('/rank/:userId', optional, getUserRank); // specific user

module.exports = router;