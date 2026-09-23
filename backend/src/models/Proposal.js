const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  fromStatus: { type: String, required: true },
  toStatus: { type: String, required: true },
  updatedBy: { type: String, required: true },
  userRole: { type: String, required: true },
  remarks: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const proposalSchema = new mongoose.Schema({
  proposalId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  projectId: {
    type: String,
    required: true,
    ref: 'Project'
  },
  projectName: {
    type: String,
    required: true
  },
  projectType: {
    type: String,
    required: true
  },
  sponsoringAgency: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  tehsil: {
    type: String,
    required: true
  },
  villages: [{ type: String }],
  requiredAreaHectares: {
    type: Number,
    required: true
  },
  estimatedCostInCrores: {
    type: Number,
    required: true
  },
  justification: {
    type: String,
    required: true
  },
  alignmentDescription: {
    type: String
  },
  status: {
    type: String,
    enum: [
      'Draft',
      'Submitted',
      'District Verification',
      'State Review',
      'Central Review',
      'Approved',
      'Rejected',
      'Acquisition Initiated'
    ],
    default: 'Draft'
  },
  submittedDate: { type: Date },
  submittedBy: {
    userId: { type: String },
    name: { type: String },
    designation: { type: String }
  },
  // District Verification Stage (DM / Collector)
  districtVerification: {
    verifiedBy: { type: String },
    verificationDate: { type: Date },
    landRecordsStatus: { type: String }, // e.g. "Verified against State Bhulekh/RoR"
    fieldInspectionDone: { type: Boolean, default: false },
    remarks: { type: String },
    passed: { type: Boolean }
  },
  // State Review Stage (Divisional Commissioner / State Revenue Secy)
  stateReview: {
    reviewedBy: { type: String },
    reviewDate: { type: Date },
    siaFeasibilityStatus: { type: String },
    remarks: { type: String },
    passed: { type: Boolean }
  },
  // Central Review Stage (Central Ministry Officer / MoRTH / MoRD)
  centralReview: {
    reviewedBy: { type: String },
    reviewDate: { type: Date },
    cabinetSanctionRef: { type: String },
    sanctionedBudgetInCrores: { type: Number },
    remarks: { type: String },
    passed: { type: Boolean }
  },
  rejectionReason: {
    type: String
  },
  rejectionDate: {
    type: Date
  },
  approvedDate: {
    type: Date
  },
  acquisitionInitiatedDate: {
    type: Date
  },
  statusHistory: [statusHistorySchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Proposal', proposalSchema);
