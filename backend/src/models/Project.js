const mongoose = require('mongoose');

const statutoryMilestoneSchema = new mongoose.Schema({
  stage: {
    type: String,
    enum: [
      'PROPOSAL_SUBMISSION',
      'SECTION_4_SIA',
      'SECTION_11_PRELIM_NOTIFICATION',
      'SECTION_15_OBJECTIONS_HEARING',
      'SECTION_19_DECLARATION',
      'SECTION_23_AWARD_DETERMINATION',
      'COMPENSATION_DISBURSEMENT',
      'SECTION_31_RR_EXECUTION',
      'SECTION_38_POSSESSION_HANDOVER'
    ],
    required: true
  },
  title: { type: String, required: true },
  statutoryCode: { type: String, required: true },
  targetDate: { type: Date, required: true },
  actualDate: { type: Date },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'OVERDUE'],
    default: 'PENDING'
  },
  approvedBy: { type: String },
  remarks: { type: String },
  gazetteRefNumber: { type: String }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  // Unique Project Identifier (e.g. PRJ-NHAI-2026-001)
  projectId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  projectType: {
    type: String,
    enum: [
      'Highway',
      'Railway',
      'Industrial Corridor',
      'Irrigation',
      'Urban Development',
      'Renewable Energy',
      'Defense',
      'Other Infrastructure'
    ],
    required: true
  },
  description: {
    type: String
  },
  ministry: {
    type: String,
    required: true,
    default: 'Ministry of Road Transport and Highways (MoRTH)'
  },
  implementingAgency: {
    type: String,
    required: true,
    default: 'National Highways Authority of India (NHAI)'
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
  village: {
    type: String,
    required: true
  },
  totalProjectArea: {
    type: Number,
    required: true // in Hectares
  },
  requiredLandArea: {
    type: Number,
    required: true // in Hectares
  },
  acquiredLandArea: {
    type: Number,
    default: 0 // in Hectares
  },
  status: {
    type: String,
    enum: [
      'Draft',
      'Proposal Submitted',
      'Under Verification',
      'Active Acquisition',
      'Awards Passed',
      'Compensation Disbursed',
      'Possession Taken',
      'Completed',
      'On Hold',
      'Litigation Flagged'
    ],
    default: 'Active Acquisition'
  },
  currentStage: {
    type: String,
    enum: [
      'PROPOSAL_SUBMITTED',
      'SIA_INITIATED',
      'SIA_APPROVED',
      'SECTION_11_NOTIFIED',
      'SECTION_15_OBJECTIONS_REVIEWED',
      'SECTION_19_DECLARED',
      'SECTION_23_AWARD_PASSED',
      'COMPENSATION_DISBURSED',
      'RR_SETTLED',
      'POSSESSION_TAKEN'
    ],
    default: 'PROPOSAL_SUBMITTED'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  expectedCompletionDate: {
    type: Date,
    required: true
  },
  actualCompletionDate: {
    type: Date
  },
  estimatedBudgetCrores: {
    type: Number,
    required: true,
    default: 100
  },
  compensationDisbursedCrores: {
    type: Number,
    default: 0
  },
  assignedOfficers: {
    calaOfficerId: { type: String },
    calaOfficerName: { type: String },
    districtOfficerId: { type: String },
    districtOfficerName: { type: String },
    surveyorOfficerId: { type: String },
    surveyorOfficerName: { type: String }
  },
  statutoryMilestones: [statutoryMilestoneSchema],
  khasraCount: {
    type: Number,
    default: 0
  },
  affectedFamiliesCount: {
    type: Number,
    default: 0
  },
  location: {
    latitude: { type: Number, default: 20.5937 },
    longitude: { type: Number, default: 78.9629 },
    city: { type: String },
    state: { type: String }
  },
  gisAnchor: {
    latitude: { type: Number, default: 20.5937 },
    longitude: { type: Number, default: 78.9629 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Backwards compatibility virtuals for existing frontend references
projectSchema.virtual('projectCode').get(function() {
  return this.projectId;
});
projectSchema.virtual('title').get(function() {
  return this.projectName;
});
projectSchema.virtual('sector').get(function() {
  return this.projectType;
});
projectSchema.virtual('targetAcquisitionAreaHectares').get(function() {
  return this.requiredLandArea;
});
projectSchema.virtual('acquiredAreaHectares').get(function() {
  return this.acquiredLandArea;
});
projectSchema.virtual('estimatedCostInCrores').get(function() {
  return this.estimatedBudgetCrores;
});
projectSchema.virtual('statesCovered').get(function() {
  return [this.state];
});
projectSchema.virtual('districtsCovered').get(function() {
  return [this.district];
});

module.exports = mongoose.model('Project', projectSchema);
