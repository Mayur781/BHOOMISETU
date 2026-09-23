const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: {
    type: String,
    required: true,
    default: 'System'
  },
  userRole: {
    type: String,
    required: true,
    default: 'SYSTEM'
  },
  action: {
    type: String,
    required: true // e.g. 'STAGE_ADVANCE', 'AWARD_CALCULATED', 'DBT_DISBURSED', 'PROPOSAL_CREATED'
  },
  resourceType: {
    type: String,
    required: true // e.g. 'Project', 'LandParcel', 'AwardCompensation', 'StatutoryStage'
  },
  resourceId: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: Object,
    default: {}
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  }
}, {
  timestamps: false
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
