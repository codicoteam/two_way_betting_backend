const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  referredId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  referralCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'expired'],
    default: 'pending'
  },
  rewards: {
    referrerBonus: { type: Number, default: 0 },
    referredBonus: { type: Number, default: 0 },
    referrerClaimed: { type: Boolean, default: false },
    referredClaimed: { type: Boolean, default: false },
    referrerClaimedAt: Date,
    referredClaimedAt: Date
  },
  conditions: {
    minBetsRequired: { type: Number, default: 5 },
    minDepositRequired: { type: Number, default: 50 },
    betsCompleted: { type: Number, default: 0 },
    depositCompleted: { type: Number, default: 0 }
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 days
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

// Indexes for efficient queries
referralSchema.index({ referralCode: 1 });
referralSchema.index({ referrerId: 1, status: 1 });
referralSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Update timestamps on save
referralSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.Referral || mongoose.model('Referral', referralSchema);