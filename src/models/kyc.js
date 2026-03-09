const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  idNumber: String,
  documentImage: String,

  status: {
    type: String,
    enum: ["pending","verified","rejected"],
    default: "pending"
  }

});

module.exports = mongoose.model("Kyc", kycSchema);