const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,

  wallet: {
    available: { type: Number, default: 0 },
    locked: { type: Number, default: 0 }
  },

  kycStatus: {
    type: String,
    enum: ["pending","verified","rejected"],
    default: "pending"
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);