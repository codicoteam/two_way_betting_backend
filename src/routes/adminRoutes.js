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

router.get('/users', getAllUsers);
router.put('/users/:userId', updateUser);
router.get('/bets', getAllBets);
router.post('/bets/:betId/resolve', resolveBet);
router.post('/matches', upsertMatch);
router.put('/matches/:matchId', upsertMatch);

module.exports = router;