const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  matchId: { 
    type: String, 
    required: true, 
    index: true 
  },
  leagueId: String,
  marketType: {
    type: String,
    enum: [
      'match_winner', 
      'over_under', 
      'btts', 
      'first_goalscorer', 
      'handicap',
      'exact_goals',
      'next_goal'
    ],
    required: true
  },
  // The prediction chosen by the creator (e.g., "home", "over2.5")
  creatorPrediction: { 
    type: String, 
    required: true 
  },
  // Odds offered by the creator (decimal format, e.g., 2.5 means profit = stake * (odds-1))
  odds: { 
    type: Number, 
    required: true, 
    min: 1.01 
  },
  // Amount the creator risks
  creatorStake: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  // Calculated when bet is accepted: backerStake = creatorStake * (odds - 1)
  backerStake: { 
    type: Number, 
    default: 0 
  },
  totalPot: { 
    type: Number, 
    default: 0 
  }, // creatorStake + backerStake
  commission: { 
    type: Number, 
    default: 0 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  acceptedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  status: {
    type: String,
    enum: ['OPEN', 'MATCHED', 'LIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED'],
    default: 'OPEN'
  },
  winnerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  // For early settlement
  acceptRequests: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedAt: { type: Date, default: Date.now }
  }],
  earlySettlement: {
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['none', 'pending', 'accepted', 'rejected', 'expired'],
      default: 'none'
    },
    requestedAt: Date,
    respondedAt: Date,
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    proposedAmount: Number,
    settledAmount: Number
  },
  resultData: {
    homeScore: Number,
    awayScore: Number,
    finalOutcome: String,
    apiResponse: mongoose.Schema.Types.Mixed
  },
  matchedAt: Date,
  startedAt: Date,
  resolvedAt: Date,
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Indexes
betSchema.index({ matchId: 1, status: 1 });
betSchema.index({ createdBy: 1, createdAt: -1 });
betSchema.index({ acceptedBy: 1, createdAt: -1 });

module.exports = mongoose.models.Bet || mongoose.model('Bet', betSchema);