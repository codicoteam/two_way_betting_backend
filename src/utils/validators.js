const Joi = require('joi');
const { MARKET_TYPE, BET_STATUS } = require('./constants');

// User registration
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).optional(),
  preferredSports: Joi.array().items(Joi.string().valid('football', 'basketball', 'tennis', 'cricket', 'baseball', 'hockey', 'other')).optional(),
  preferredLeagues: Joi.array().items(Joi.string()).max(5).optional(),
});

// Login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Firebase / Google sign-in
const firebaseAuthSchema = Joi.object({
  idToken: Joi.string().required(),
});

// Create bet
const createBetSchema = Joi.object({
  matchId: Joi.string().required(),
  marketType: Joi.string().valid(...Object.values(MARKET_TYPE)).required(),
  creatorPrediction: Joi.string().required(),
  odds: Joi.number().min(1.01).optional(),
  creatorStake: Joi.number().min(1).required(),
});

// Accept bet
const acceptBetSchema = Joi.object({
  betId: Joi.string().required(),
});

const selectOpponentSchema = Joi.object({
  backerId: Joi.string().required(),
});

// Early settlement request
const earlySettlementSchema = Joi.object({
  proposedAmount: Joi.number().min(0).optional(),
});

// Deposit
const depositSchema = Joi.object({
  amount: Joi.number().min(1).required(),
});

// Withdrawal
const withdrawalSchema = Joi.object({
  amount: Joi.number().min(5).required(),
  phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).optional(),
  method: Joi.string().valid('ecocash', 'onemoney').default('ecocash'),
});

const betOfferSchema = Joi.object({
  betId: Joi.string(),
  marketType: Joi.string().valid(...Object.values(MARKET_TYPE)),
  creatorPrediction: Joi.string(),
  odds: Joi.number().min(1.01),
  creatorStake: Joi.number().min(1),
  outcome: Joi.string().max(100),
}).custom((value, helpers) => {
  if (!value) return value;
  if (value.betId) return value;
  const required = ['marketType', 'creatorPrediction', 'odds', 'creatorStake'];
  const missing = required.filter((field) => value[field] === undefined || value[field] === null);
  if (missing.length) {
    return helpers.error('any.custom', { message: `betOffer must include betId or all of: ${required.join(', ')}` });
  }
  return value;
}, 'Bet offer validation');

// Match chat message
const chatMessageSchema = Joi.object({
  message: Joi.string().max(500).allow('').optional(),
  betOffer: betOfferSchema.optional(),
}).or('message', 'betOffer');

// Private message
const privateMessageSchema = Joi.object({
  toUserId: Joi.string(),
  recipientId: Joi.string(),
  message: Joi.string().max(1000).required(),
}).or('toUserId', 'recipientId');

// Update profile
const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).optional(),
  favoriteTeam: Joi.string().optional(),
  avatar: Joi.string().uri().optional(),
  preferredSports: Joi.array().items(Joi.string().valid('football', 'basketball', 'tennis', 'cricket', 'baseball', 'hockey', 'other')).optional(),
  preferredLeagues: Joi.array().items(Joi.string()).max(5).optional(),
});

module.exports = {
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
};