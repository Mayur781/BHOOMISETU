const mongoose = require('mongoose');

const rrCaseSchema = new mongoose.Schema({
  rrCaseNumber: {
    type: String,
    required: true,
    unique: true
  }, // e.g. "RRC-2026-001"
  projectId: {
    type: String,
    required: true,
    ref: 'Project'
  },
  familyRegistrationId: {
    type: String,
    required: true
  },
  familyHeadName: {
    type: String,
    required: true
  },
  village: {
    type: String,
    required: true
  },
  resettlementHouseAllotted: {
    type: Boolean,
    default: false
  },
  allottedPlotNumber: {
    type: String
  },
  cashGrantInLieuOfHouse: {
    type: Number,
    default: 0
  },
  subsistenceAllowanceAmount: {
    type: Number,
    default: 36000 // ₹3,000/month for 1 year
  },
  subsistenceAllowanceStatus: {
    type: String,
    enum: ['Pending', 'Disbursed', 'Not Applicable'],
    default: 'Pending'
  },
  transportationAllowanceAmount: {
    type: Number,
    default: 50000
  },
  transportationAllowanceStatus: {
    type: String,
    enum: ['Pending', 'Disbursed', 'Not Applicable'],
    default: 'Pending'
  },
  cattleShedPettyShopGrant: {
    type: Number,
    default: 25000
  },
  livelihoodSettlement: {
    type: String,
    enum: [
      'One-time Lump Sum Grant (₹5,00,000)',
      'Mandatory Employment in Infrastructure Asset',
      'Monthly Annuity of ₹2,000 for 20 years'
    ],
    default: 'One-time Lump Sum Grant (₹5,00,000)'
  },
  livelihoodStatus: {
    type: String,
    enum: ['Pending Settlement', 'Settled / Disbursed'],
    default: 'Pending Settlement'
  },
  caseStatus: {
    type: String,
    enum: ['Under Verification', 'Scheme Approved', 'Disbursement In Progress', 'Fully Settled'],
    default: 'Scheme Approved'
  },
  settlementDate: {
    type: Date
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RRCase', rrCaseSchema);
