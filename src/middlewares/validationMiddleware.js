const {
  registerSchema,
  loginSchema,
  createBetSchema,
  acceptBetSchema,
  selectOpponentSchema,
  earlySettlementSchema,
  depositSchema,
  withdrawalSchema,
  chatMessageSchema,
  privateMessageSchema,
  updateProfileSchema,
} = require('../utils/validators');

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({ success: false, errors });
    }
    next();
  };
};

// Specific validators
exports.validateRegister = validate(registerSchema);
exports.validateLogin = validate(loginSchema);
exports.validateCreateBet = validate(createBetSchema);
exports.validateAcceptBet = validate(acceptBetSchema);
exports.validateSelectOpponent = validate(selectOpponentSchema);
exports.validateEarlySettlement = validate(earlySettlementSchema);
exports.validateDeposit = validate(depositSchema);
exports.validateWithdrawal = validate(withdrawalSchema);
exports.validateChatMessage = validate(chatMessageSchema);
exports.validatePrivateMessage = validate(privateMessageSchema);
exports.validateUpdateProfile = validate(updateProfileSchema);