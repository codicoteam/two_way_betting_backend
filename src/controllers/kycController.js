const kycService = require('../services/kycService');

exports.submitKyc = async (req, res, next) => {
  try {
    const documents = {
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      nationality: req.body.nationality,
      idType: req.body.idType,
      idNumber: req.body.idNumber,
      documentFront: req.files?.documentFront?.[0]?.path,
      documentBack: req.files?.documentBack?.[0]?.path,
      selfie: req.files?.selfie?.[0]?.path,
    };
    const kyc = await kycService.submitKyc(req.user.id, documents);
    res.json({ success: true, data: kyc });
  } catch (error) {
    next(error);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const status = await kycService.getKycStatus(req.user.id);
    res.json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
};

// Admin endpoints
exports.getAllKyc = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { status } = req.query;
    const result = await kycService.getAllKyc(status, page, limit);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.verifyKyc = async (req, res, next) => {
  try {
    const { kycId } = req.params;
    const { status, rejectionReason } = req.body;
    const kyc = await kycService.verifyKyc(kycId, req.user.id, status, rejectionReason);
    res.json({ success: true, data: kyc });
  } catch (error) {
    next(error);
  }
};