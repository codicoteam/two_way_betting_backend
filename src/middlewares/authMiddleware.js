const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { jwtSecret } = require('../configs/auth');

/**
 * Verify JWT token and attach user to request object
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Get user from database
    const user = await User.findById(decoded.id).select('-passwordHash -refreshToken');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    next(error);
  }
};

/**
 * Optional authentication – attach user if token exists, but don't block
 */
exports.optional = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, jwtSecret);
      const user = await User.findById(decoded.id).select('-passwordHash -refreshToken');
      if (user) req.user = user;
    }
    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};