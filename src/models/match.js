const mongoose = require('mongoose');
const { SUPPORTED_SPORTS } = require('../utils/constants');

const matchSchema = new mongoose.Schema({
  matchId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  sport: { 
    type: String,
    enum: SUPPORTED_SPORTS,
    default: 'football',
  },
  leagueId: String,
  leagueName: String,
  homeTeam: {
    id: String,
    name: String,
    logo: String,
    stats: mongoose.Schema.Types.Mixed // For team performance data
  },
  awayTeam: {
    id: String,
    name: String,
    logo: String,
    stats: mongoose.Schema.Types.Mixed
  },
  startTime: { 
    type: Date, 
    required: true, 
    index: true 
  },
  status: {
    type: String,
    enum: [
      'NS',    // Not Started
      'LIVE', 
      'HT',    // Halftime
      'FT',    // Full Time
      'SETTLED', // Settled after bets are processed
      'CANC',  // Cancelled
      'POSTP', // Postponed
      'ABAN',  // Abandoned
      'SUSP'   // Suspended
    ],
    default: 'NS'
  },
  scores: {
    home: { type: Number, default: 0 },
    away: { type: Number, default: 0 },
    halftime: {
      home: Number,
      away: Number
    },
    fulltime: {
      home: Number,
      away: Number
    }
  },
  // For live betting: current minute, events (goals, cards) can be stored if needed
  currentMinute: Number,
  events: [{
    type: { type: String, enum: ['goal', 'card', 'substitution', 'penalty'] },
    team: { type: String, enum: ['home', 'away'] },
    player: String,
    minute: Number,
    details: mongoose.Schema.Types.Mixed
  }],
  apiProvider: { 
    type: String, 
    enum: ['api-football', 'thesportsdb', 'opta'] 
  },
  apiResponse: mongoose.Schema.Types.Mixed, // Cached full API response
  cacheExpiry: Date, // For Redis integration
  lastFetched: { 
    type: Date, 
    default: Date.now 
  },
  // Bet count for the match (updated via aggregation)
  betCount: {
    type: Number,
    default: 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// TTL index to auto-delete old matches after 7 days
matchSchema.index({ lastFetched: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.models.Match || mongoose.model('Match', matchSchema);