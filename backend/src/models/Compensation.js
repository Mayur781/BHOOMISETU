const mongoose = require('mongoose');

const compensationSchema = new mongoose.Schema({
  compensationId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }, // e.g. "CMP-2026-001"
  projectId: {
    type: String,
    required: true,
    ref: 'Project'
  },
  awardNumber: {
    type: String
  },
  khasraNumber: {
    type: String,
    required: true
  },
  village: {
    type: String,
    required: true
  },
  beneficiaryName: {
    type: String,
    required: true
  },
  beneficiaryAadhaarMasked: {
    type: String,
    default: 'XXXX-XXXX-8921'
  },
  beneficiaryPan: {
    type: String
  },
  bankAccountNumber: {
    type: String,
    required: true
  },
  bankIfsc: {
    type: String,
    required: true
  },
  bankName: {
    type: String,
    default: 'State Bank of India'
  },
  acquiredAreaHectares: {
    type: Number,
    required: true
  },
  circleRatePerHectare: {
    type: Number,
    required: true
  },
  multiplicationFactor: {
    type: Number,
    default: 1.5 // 1.0 to 2.0 depending on rural/urban distance
  },
  marketValueAssessed: {
    type: Number,
    required: true
  },
  assetsValue: {
    type: Number,
    default: 0
  },
  totalBaseCompensation: {
    type: Number,
    required: true
  },
  solatiumAmount: {
    type: Number,
    required: true // 100% Solatium
  },
  additionalInterest: {
    type: Number,
    required: true // 12%
  },
  totalCompensationPayable: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending Assessment', 'Approved', 'PFMS Batch Generated', 'DBT Disbursed', 'Failed / Returned'],
    default: 'Approved'
  },
  pfmsReferenceNumber: {
    type: String
  },
  dbtTransactionId: {
    type: String
  },
  disbursementDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Compensation', compensationSchema);
