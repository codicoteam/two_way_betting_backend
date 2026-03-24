const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sport: {
    type: String,
    default: 'football',
    index: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'all-time'],
    required: true,
    index: true
  },
  periodStart: {
    type: Date,
    required: true,
    index: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  rank: {
    type: Number,
    required: true,
    index: true
  },
  previousRank: {
    type: Number,
    default: null
  },
  stats: {
    totalBets: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 }, // percentage
    profit: { type: Number, default: 0 },
    winStreak: { type: Number, default: 0 },
    totalStaked: { type: Number, default: 0 },
    totalWon: { type: Number, default: 0 }
  },
  rewards: {
    badge: String, // e.g., 'Top Bettor', 'Lucky Winner'
    bonusAmount: { type: Number, default: 0 },
    claimed: { type: Boolean, default: false },
    claimedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for efficient queries
leaderboardSchema.index({ sport: 1, period: 1, rank: 1 });
leaderboardSchema.index({ userId: 1, sport: 1, period: 1 });

// Update timestamps on save
leaderboardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.Leaderboard || mongoose.model('Leaderboard', leaderboardSchema);