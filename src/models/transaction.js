const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  type: {
    type: String,
    enum: [
      'deposit', 
      'withdrawal', 
      'bet_lock', 
      'bet_release', 
      'bet_win', 
      'commission', 
      'refund',
      'early_settlement'   // for early settlement payouts
    ],
    required: true
  },
  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: 'USD' 
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  reference: { 
    type: String, 
    unique: true,
    sparse: true 
  },
  betId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Bet' 
  },
  description: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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

transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);