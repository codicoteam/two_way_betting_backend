const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  type: {
    type: String,
    enum: [
      'bet_created',
      'bet_matched',
      'bet_live',
      'bet_settled',
      'bet_cancelled',
      'bet_disputed',
      'early_settlement_request',
      'early_settlement_response',
      'wallet_credit',
      'wallet_debit',
      'kyc_status',
      'system_alert',
      'match_chat_message',      // when someone messages in a match chat
      'private_message',         // when you receive a private message
      'badge_earned',            // when you earn a new badge
      'settlement_request',      // when opponent requests early settlement
      'settlement_response' ,     // when opponent responds to your request
      'leaderboard_update'
    ],
    required: true
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  data: {
    betId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bet' },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    matchId: String,
    amount: Number,
    // Any other relevant data
  },
  isRead: { 
    type: Boolean, 
    default: false, 
    index: true 
  },
  readAt: Date,
  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: true 
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 days
  }
});

// TTL index for auto-cleanup
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);