const mongoose = require('mongoose');

const awardCompensationSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  parcelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LandParcel',
    required: true
  },
  awardNumber: {
    type: String,
    required: true,
    unique: true
  },
  dateOfAward: {
    type: Date,
    default: Date.now
  },
  // Section 26-30 Statutory Breakdown
  calculation: {
    baseLandMarketValue: { type: Number, required: true }, // Section 26 base value
    ruralUrbanMultiplierFactor: { type: Number, required: true, default: 1.0 }, // 1.0x - 2.0x
    multipliedLandValue: { type: Number, required: true },
    assetsValueStructures: { type: Number, default: 0 }, // Section 29
    assetsValueTreesCrops: { type: Number, default: 0 }, // Section 29
    solatiumAmount: { type: Number, required: true }, // 100% of (multiplied value + assets) as per Sec 30(1)
    additionalInterestMonths: { type: Number, default: 12 },
    additionalInterestAmount: { type: Number, required: true }, // 12% p.a. as per Sec 30(3)
    totalCompensationPayable: { type: Number, required: true }
  },
  disbursements: [{
    ownerName: { type: String, required: true },
    bankAccount: { type: String, required: true },
    ifscCode: { type: String, required: true },
    bankName: { type: String, default: 'State Bank of India' },
    amountShare: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PFMS_QUEUED', 'DISBURSED_SUCCESS', 'FAILED_RETRY', 'HELD_IN_ESCROW'],
      default: 'PENDING'
    },
    utrNumber: { type: String },
    disbursedAt: { type: Date }
  }],
  status: {
    type: String,
    enum: ['DRAFT', 'APPROVED_BY_CALA', 'DISBURSEMENT_IN_PROGRESS', 'FULLY_DISBURSED', 'DISPUTED'],
    default: 'APPROVED_BY_CALA'
  },
  calaDigitalSignature: {
    officerName: { type: String },
    digitalHash: { type: String },
    signedAt: { type: Date }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AwardCompensation', awardCompensationSchema);
