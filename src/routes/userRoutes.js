const express = require('express');
const { getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { validateUpdateProfile } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.get('/profile/:userId', protect, getProfile); // view other user's profile
router.put('/profile', protect, validateUpdateProfile, updateProfile);

module.exports = router;