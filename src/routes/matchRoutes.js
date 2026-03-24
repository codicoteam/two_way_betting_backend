const express = require('express');
const {
  getUpcomingMatches,
  getLiveMatches,
  getMatchById,
  refreshMatches,
} = require('../controllers/matchController');
const { protect, optional } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/adminMiddleware');

const router = express.Router();

router.get('/upcoming', optional, getUpcomingMatches);
router.get('/live', optional, getLiveMatches);
router.get('/:id', optional, getMatchById);
router.post('/refresh', protect, adminOnly, refreshMatches); // admin only

module.exports = router;