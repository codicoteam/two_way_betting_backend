const rateLimit = require('express-rate-limit');
const { authLimiter, limiter } = require('../configs/rate-limit');

// General rate limiter (applied to all routes)
exports.generalLimiter = limiter;

// Stricter limiter for auth endpoints (login, register)
exports.authLimiter = authLimiter;

// Custom limiter for specific use cases (e.g., bet creation)
exports.createBetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // max 20 bet creations per hour
  message: 'Too many bet creations, please try again later.',
});

// Chat message limiter
exports.chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  message: 'Too many messages, slow down.',
});