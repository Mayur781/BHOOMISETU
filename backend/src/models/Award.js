const mongoose = require('mongoose');

const awardSchema = new mongoose.Schema({
  awardNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }, // e.g. "AWD-THN-SEC23-2026-001"
  projectId: {
    type: String,
    required: true,
    ref: 'Project'
  },
  section: {
    type: String,
    default: 'Section 23 & 30'
  },
  awardDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  passedBy: {
    type: String,
    required: true // e.g. "Shri Suresh K. Patil, CALA & Deputy Collector"
  },
  approvedByCollector: {
    type: String
  },
  khasraNumbersCovered: [{ type: String }],
  totalAreaHectares: {
    type: Number,
    required: true
  },
  assessedLandMarketValue: {
    type: Number,
    required: true // in INR
  },
  structuresValue: {
    type: Number,
    default: 0
  },
  treesAndCropsValue: {
    type: Number,
    default: 0
  },
  totalBaseCompensation: {
    type: Number,
    required: true
  },
  solatiumPercentage: {
    type: Number,
    default: 100 // 100% mandatory under Sec 30(1)
  },
  solatiumAmount: {
    type: Number,
    required: true // Equal to 100% of base
  },
  additionalInterestRate: {
    type: Number,
    default: 12 // 12% per annum under Sec 30(3)
  },
  additionalInterestAmount: {
    type: Number,
    required: true
  },
  totalAwardAmount: {
    type: Number,
    required: true // Base + Solatium + Interest
  },
  status: {
    type: String,
    enum: ['Draft', 'Approved by Collector', 'Published', 'Disbursement In Progress', 'Fully Settled'],
    default: 'Approved by Collector'
  },
  digitalSignatureHash: {
    type: String,
    default: () => 'SHA256:' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  },
  awardDocumentUrl: {
    type: String,
    default: '/documents/award_section23_sample.pdf'
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Award', awardSchema);
