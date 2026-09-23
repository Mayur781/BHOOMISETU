const mongoose = require('mongoose');

const objectionSchema = new mongoose.Schema({
  petitionerName: { type: String, required: true },
  khasraNumber: { type: String, required: true },
  objectionType: {
    type: String,
    enum: [
      'Measurement / Boundary Error',
      'Ownership / Title Dispute',
      'Inadequate Circle / Market Rate',
      'Irrigation / Well Asset Omission',
      'Religious / Heritage Site Impact'
    ],
    required: true
  },
  description: { type: String, required: true },
  hearingDate: { type: Date },
  status: {
    type: String,
    enum: ['PENDING', 'HEARD_UPHELD', 'DISMISSED_WITH_REASONS', 'REFERRED_TO_AUTHORITY'],
    default: 'PENDING'
  },
  resolutionRemarks: { type: String },
  resolvedAt: { type: Date }
}, { _id: true });

const statutoryStageSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  stageCode: {
    type: String,
    enum: [
      'SEC_4_SIA',
      'SEC_11_PRELIM_NOTIFICATION',
      'SEC_15_HEARING_OBJECTIONS',
      'SEC_19_DECLARATION',
      'SEC_23_AWARD',
      'SEC_38_POSSESSION'
    ],
    required: true
  },
  stageTitle: { type: String, required: true },
  status: {
    type: String,
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'PUBLISHED', 'APPROVED', 'OVERDUE'],
    default: 'NOT_STARTED'
  },
  initiatedDate: { type: Date },
  statutoryDeadlineDate: { type: Date },
  completedDate: { type: Date },
  gazetteDetails: {
    notificationNumber: { type: String },
    publicationDate: { type: Date },
    newspaperHindi: { type: String },
    newspaperEnglish: { type: String },
    stateOfficialGazetteRef: { type: String },
    eGazetteDownloadUrl: { type: String }
  },
  siaFindings: {
    agencyName: { type: String },
    affectedFamiliesCount: { type: Number, default: 0 },
    publicHearingsConducted: { type: Number, default: 0 },
    socialImpactMitigationCostInLakhs: { type: Number, default: 0 },
    expertGroupRecommendation: {
      type: String,
      enum: ['RECOMMENDED', 'RECOMMENDED_WITH_CONDITIONS', 'REJECTED'],
      default: 'RECOMMENDED'
    }
  },
  objections: [objectionSchema],
  possessionDetails: {
    possessionMemoNumber: { type: String },
    handoverDate: { type: Date },
    possessionAreaHectares: { type: Number },
    jointInspectionOfficers: [{ type: String }],
    certificateSigned: { type: Boolean, default: false }
  },
  actionBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  officerRemarks: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('StatutoryStage', statutoryStageSchema);
