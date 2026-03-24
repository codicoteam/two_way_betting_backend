const express = require('express');
const {
  submitKyc,
  getStatus,
  getAllKyc,
  verifyKyc,
} = require('../controllers/kycController');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/adminMiddleware');
const { uploadKycDocuments, handleMulterError } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// User routes
router.post('/submit', protect, uploadKycDocuments, handleMulterError, submitKyc);
router.get('/status', protect, getStatus);

// Admin routes
router.get('/all', protect, adminOnly, getAllKyc);
router.put('/verify/:kycId', protect, adminOnly, verifyKyc);

module.exports = router;