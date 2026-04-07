const mongoose = require('mongoose');

const matchChatSchema = new mongoose.Schema({
  matchId: { 
    type: String, 
    required: true, 
    index: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: {
    type: String,
    enum: ['message', 'bet_offer'],
    default: 'message',
  },
  message: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500 
  },
  betOffer: {
    betId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bet' },
    marketType: { type: String },
    creatorPrediction: { type: String },
    odds: { type: Number },
    creatorStake: { type: Number },
    outcome: { type: String },
    status: { type: String },
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// TTL index to auto-delete old messages after 60 days
matchChatSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 });

module.exports = mongoose.models.MatchChat || mongoose.model('MatchChat', matchChatSchema);