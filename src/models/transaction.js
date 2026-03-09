const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  type: {
    type: String,
    enum: ["deposit","withdraw","bet_lock","bet_win","refund","commission"]
  },

  amount: Number,

  betId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bet"
  },

  createdAt: { type: Date, default: Date.now }

});

module.exports = mongoose.model("Transaction", transactionSchema);