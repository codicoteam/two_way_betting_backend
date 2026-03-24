const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  fullName: String,
  dateOfBirth: Date,
  nationality: String,
  idType: { 
    type: String, 
    enum: ['passport', 'national_id', 'driver_license'] 
  },
  idNumber: String,
  documentFront: String,   // URL to uploaded image
  documentBack: String,
  selfie: String,
  status: { 
    type: String, 
    enum: ['pending', 'verified', 'rejected'], 
    default: 'pending' 
  },
  verifiedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  verifiedAt: Date,
  rejectionReason: String,
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

kycSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.Kyc || mongoose.model('Kyc', kycSchema);