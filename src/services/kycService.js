const Kyc = require('../models/kyc');
const User = require('../models/user');
const { KYC_STATUS } = require('../utils/constants');
const notificationService = require('./notificationService');

/**
 * Submit KYC documents
 */
exports.submitKyc = async (userId, documents) => {
  const { fullName, dateOfBirth, nationality, idType, idNumber, documentFront, documentBack, selfie } = documents;

  // Check if KYC already exists
  let kyc = await Kyc.findOne({ userId });
  if (kyc) {
    // Update existing pending KYC
    if (kyc.status !== KYC_STATUS.PENDING) {
      throw new Error('KYC already processed. Contact support for updates.');
    }
    kyc.set({ fullName, dateOfBirth, nationality, idType, idNumber, documentFront, documentBack, selfie });
  } else {
    kyc = new Kyc({
      userId,
      fullName,
      dateOfBirth,
      nationality,
      idType,
      idNumber,
      documentFront,
      documentBack,
      selfie,
    });
  }

  await kyc.save();
  return kyc;
};

/**
 * Verify KYC (admin)
 */
exports.verifyKyc = async (kycId, adminId, status, rejectionReason = null) => {
  const kyc = await Kyc.findById(kycId);
  if (!kyc) throw new Error('KYC submission not found');

  kyc.status = status;
  kyc.verifiedBy = adminId;
  kyc.verifiedAt = new Date();
  if (rejectionReason) kyc.rejectionReason = rejectionReason;
  await kyc.save();

  // Update user's kycStatus
  await User.findByIdAndUpdate(kyc.userId, { kycStatus: status });

  // Notify user
  await notificationService.create({
    userId: kyc.userId,
    type: 'kyc_status',
    title: `KYC ${status}`,
    message: status === 'verified' ? 'Your identity has been verified.' : `Your KYC was rejected: ${rejectionReason}`,
    data: { status, reason: rejectionReason },
  });

  return kyc;
};

/**
 * Get KYC status for a user
 */
exports.getKycStatus = async (userId) => {
  const kyc = await Kyc.findOne({ userId });
  if (!kyc) return { status: 'not_submitted' };
  return { status: kyc.status, submittedAt: kyc.createdAt, verifiedAt: kyc.verifiedAt };
};

/**
 * Get all KYC submissions (admin)
 */
exports.getAllKyc = async (status = null, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const query = status ? { status } : {};
  const kycs = await Kyc.find(query)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Kyc.countDocuments(query);
  return { kycs, total, page, totalPages: Math.ceil(total / limit) };
};