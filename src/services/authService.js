const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { jwtSecret, jwtRefreshSecret, jwtExpiresIn, jwtRefreshExpiresIn, bcryptRounds } = require('../configs/auth');
const { generateReferralCode } = require('../utils/helpers');
const firebaseService = require('./firebaseService');
const logger = require('../utils/logger');

/**
 * Register a new user
 */
exports.register = async ({ name, email, password, phone, preferredSports, preferredLeagues }) => {
  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, bcryptRounds);

  // Create user
  const user = await User.create({
    name,
    email,
    passwordHash,
    phone,
    preferredSports: preferredSports || [],
    preferredLeagues: preferredLeagues || [],
    referralCode: generateReferralCode(),
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

/**
 * Login user
 */
exports.login = async ({ email, password }) => {
  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh access token
 */
exports.refreshToken = async (refreshToken) => {
  if (!refreshToken) throw new Error('Refresh token required');

  try {
    const decoded = jwt.verify(refreshToken, jwtRefreshSecret);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    const newAccessToken = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: jwtExpiresIn });
    return { accessToken: newAccessToken };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

exports.loginWithFirebase = async ({ idToken }) => {
  const decodedToken = await firebaseService.verifyIdToken(idToken);
  const { uid, email, name: displayName, picture } = decodedToken;

  if (!email) {
    throw new Error('Firebase token is missing an email address');
  }

  let user = await User.findOne({ firebaseUid: uid });
  if (!user) {
    user = await User.findOne({ email });
  }

  if (user) {
    if (!user.firebaseUid) {
      user.firebaseUid = uid;
      user.provider = 'google';
      if (!user.avatar && picture) user.avatar = picture;
      if ((!user.name || user.name.trim() === '') && displayName) user.name = displayName;
    }
  } else {
    user = await User.create({
      name: displayName || email.split('@')[0],
      email,
      avatar: picture || '',
      firebaseUid: uid,
      provider: 'google',
    });
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
    refreshToken,
  };
};

/**
 * Logout – clear refresh token
 */
exports.logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

// Helper to generate tokens
function generateTokens(userId) {
  const accessToken = jwt.sign({ id: userId }, jwtSecret, { expiresIn: jwtExpiresIn });
  const refreshToken = jwt.sign({ id: userId }, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn });
  return { accessToken, refreshToken };
}