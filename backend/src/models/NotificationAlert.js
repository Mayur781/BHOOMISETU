const mongoose = require('mongoose');

const notificationAlertSchema = new mongoose.Schema({
  alertId: {
    type: String,
    required: true,
    unique: true
  },
  recipientRole: {
    type: String,
    required: true // e.g. 'DISTRICT_AUTHORITY_OFFICER', 'LAND_ACQUISITION_OFFICER'
  },
  recipientUserId: {
    type: String
  },
  projectId: {
    type: String,
    ref: 'Project'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  alertType: {
    type: String,
    enum: [
      'STATUTORY_DEADLINE',
      'STAGE_ADVANCE',
      'PROPOSAL_SUBMITTED',
      'PROPOSAL_VERIFIED',
      'PROPOSAL_APPROVED',
      'DISBURSAL_COMPLETED',
      'ACTION_REQUIRED'
    ],
    default: 'ACTION_REQUIRED'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: '/dashboard'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NotificationAlert', notificationAlertSchema);
