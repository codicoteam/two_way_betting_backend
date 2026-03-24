const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  icon: { 
    type: String, 
    required: true 
  }, // URL or emoji
  category: {
    type: String,
    enum: ['streak', 'loyalty', 'profit', 'special'],
    default: 'special'
  },
  criteria: {
    type: { 
      type: String, 
      enum: ['wins', 'streak', 'bets_on_team', 'profit_amount', 'referrals'],
      required: true 
    },
    threshold: { type: Number, required: true },
    teamId: { type: String } // for team-specific badges like "Liverpool Loyalist"
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.models.Badge || mongoose.model('Badge', badgeSchema);