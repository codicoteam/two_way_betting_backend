const mongoose = require('mongoose');

const privateMessageSchema = new mongoose.Schema({
  conversationId: { 
    type: String, 
    required: true, 
    index: true 
  }, // composite of both user IDs sorted, e.g., "userA_userB"
  fromUserId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  toUserId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 1000 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for fetching conversation history
privateMessageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.models.PrivateMessage || mongoose.model('PrivateMessage', privateMessageSchema);