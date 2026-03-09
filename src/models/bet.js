const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({

  matchId: String,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  stake: Number,

  prediction: String,

  status: {
    type: String,
    enum: ["OPEN","MATCHED","LIVE","COMPLETED","CANCELLED"],
    default: "OPEN"
  },

  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  createdAt: { type: Date, default: Date.now }

});

module.exports = mongoose.model("Bet", betSchema);