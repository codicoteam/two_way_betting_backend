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

/**
 * @swagger
 * /api/kyc/submit:
 *   post:
 *     summary: Submit KYC documents
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               idDocument: { type: string, format: binary }
 *               proofOfAddress: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: KYC submitted for verification
 */
router.post('/submit', protect, uploadKycDocuments, handleMulterError, submitKyc);

/**
 * @swagger
 * /api/kyc/status:
 *   get:
 *     summary: Get KYC verification status
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC status (pending/verified/rejected)
 */
router.get('/status', protect, getStatus);

/**
 * @swagger
 * /api/kyc/all:
 *   get:
 *     summary: Get all KYC submissions (admin only)
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all KYC submissions
 */
router.get('/all', protect, adminOnly, getAllKyc);

/**
 * @swagger
 * /api/kyc/verify/{kycId}:
 *   put:
 *     summary: Verify/reject KYC (admin only)
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kycId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approved: { type: boolean }
 *     responses:
 *       200:
 *         description: KYC status updated
 */
router.put('/verify/:kycId', protect, adminOnly, verifyKyc);

module.exports = router;