const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user_suspend',
      'user_activate',
      'bet_cancel',
      'bet_settle',
      'dispute_resolve',
      'kyc_approve',
      'kyc_reject',
      'withdrawal_approve',
      'withdrawal_reject',
      'commission_adjust',
      'system_config',
      'risk_flag',
      'aml_alert'
    ]
  },
  targetType: {
    type: String,
    enum: ['user', 'bet', 'transaction', 'kyc', 'system'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: String,
  userAgent: String,
  reason: String,
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient admin panel queries
adminLogSchema.index({ adminId: 1, createdAt: -1 });
adminLogSchema.index({ action: 1, createdAt: -1 });
adminLogSchema.index({ targetType: 1, targetId: 1 });

// Update timestamps on save
adminLogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.AdminLog || mongoose.model('AdminLog', adminLogSchema);