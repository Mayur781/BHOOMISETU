const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  milestoneId: {
    type: String,
    required: true,
    unique: true
  }, // e.g. "MLS-2026-001"
  projectId: {
    type: String,
    required: true,
    ref: 'Project'
  },
  stageCode: {
    type: String,
    enum: [
      'SEC_3A_PROPOSAL',
      'SEC_4_SIA',
      'SEC_11_NOTIFICATION',
      'SEC_15_OBJECTIONS',
      'SEC_19_DECLARATION',
      'SEC_23_AWARD',
      'SEC_30_COMPENSATION',
      'SEC_31_RR',
      'SEC_38_POSSESSION'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  statutoryReference: {
    type: String,
    required: true // e.g. "RFCTLARR Sec 11(1)"
  },
  targetDate: {
    type: Date,
    required: true
  },
  actualDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Delayed', 'Overdue'],
    default: 'Pending'
  },
  delayDays: {
    type: Number,
    default: 0
  },
  delayReason: {
    type: String
  },
  actionOfficer: {
    type: String
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Milestone', milestoneSchema);
