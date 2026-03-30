const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const preferencesRoutes = require('./preferencesRoutes');
const walletRoutes = require('./walletRoutes');
const betRoutes = require('./betRoutes');
const matchRoutes = require('./matchRoutes');
const marketplaceRoutes = require('./marketplaceRoutes');
const messageRoutes = require('./messageRoutes');
const chatRoutes = require('./chatRoutes');
const kycRoutes = require('./kycRoutes');
const leaderboardRoutes = require('./leaderboardRoutes');
const badgeRoutes = require('./badgeRoutes');
const paymentRoutes = require('./paymentRoutes');
const webhookRoutes = require('./webhookRoutes');
const adminRoutes = require('./adminRoutes');
const supportRoutes = require('./supportRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/preferences', preferencesRoutes);
router.use('/wallet', walletRoutes);
router.use('/bets', betRoutes);
router.use('/matches', matchRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/messages', messageRoutes);
router.use('/chat', chatRoutes);
router.use('/support', supportRoutes);
router.use('/kyc', kycRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/badges', badgeRoutes);
router.use('/payments', paymentRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/admin', adminRoutes);

module.exports = router;