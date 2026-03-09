const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({

  matchId: String,

  homeTeam: String,
  awayTeam: String,

  startTime: Date,

  status: String,

  homeScore: Number,
  awayScore: Number

});

module.exports = mongoose.model("Match", matchSchema);