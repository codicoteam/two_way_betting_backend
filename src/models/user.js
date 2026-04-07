const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true 
  },
  passwordHash: { 
    type: String, 
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true,
  },
  provider: {
    type: String,
    enum: ['password', 'google'],
    default: 'password',
  },
  phone: { 
    type: String,
    trim: true 
  },
  avatar: { 
    type: String, 
    default: '' 
  }, // URL to profile picture
  favoriteTeam: { 
    type: String, 
    default: '' 
  },
  preferredSports: [{
    type: String,
    enum: ['football', 'basketball', 'tennis', 'cricket', 'baseball', 'hockey', 'other']
  }],
  preferredLeagues: [{
    type: String
  }],
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  wallet: {
    available: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    locked: { 
      type: Number, 
      default: 0, 
      min: 0 
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'support'],
    default: 'user'
  },
  refreshToken: { 
    type: String 
  },
  // Profile statistics (updated via background jobs after each settlement)
  stats: {
    totalBets: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    winStreak: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },      // net profit (positive only shown in UI)
    winRate: { type: Number, default: 0 },      // computed as wins/totalBets * 100
    updatedAt: { type: Date }
  },
  // Badges earned by the user (references to Badge model)
  badges: [{
    badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' },
    earnedAt: { type: Date, default: Date.now }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update timestamps on save
userSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Index for leaderboard queries
userSchema.index({ 'stats.profit': -1 });
userSchema.index({ 'stats.wins': -1 });
userSchema.index({ 'stats.winStreak': -1 });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);