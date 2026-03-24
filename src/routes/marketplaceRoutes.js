const express = require('express');
const { getOpenBetsForMatch } = require('../controllers/marketplaceController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/match/:matchId', protect, getOpenBetsForMatch);

module.exports = router;