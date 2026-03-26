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

// Create bet
const createBetSchema = Joi.object({
  matchId: Joi.string().required(),
  marketType: Joi.string().valid(...Object.values(MARKET_TYPE)).required(),
  creatorPrediction: Joi.string().required(),
  odds: Joi.number().min(1.01).required(),
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
});

// Match chat message
const chatMessageSchema = Joi.object({
  message: Joi.string().max(500).required(),
});

// Private message
const privateMessageSchema = Joi.object({
  toUserId: Joi.string().required(),
  message: Joi.string().max(1000).required(),
});

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