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
  message: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// TTL index to auto-delete old messages after 24 hours (optional)
matchChatSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.models.MatchChat || mongoose.model('MatchChat', matchChatSchema);