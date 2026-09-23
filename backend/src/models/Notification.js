const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notificationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }, // e.g. "S.O. 1245(E)" or "REV-THN-SEC11-2026-003"
  projectId: {
    type: String,
    required: true,
    ref: 'Project'
  },
  section: {
    type: String,
    enum: [
      'Section 4 SIA',
      'Section 11 Preliminary',
      'Section 15 Objections',
      'Section 19 Declaration',
      'Section 21 Public Notice'
    ],
    required: true
  },
  gazetteNumber: {
    type: String,
    required: true
  },
  gazetteDate: {
    type: Date,
    required: true
  },
  publicationDate: {
    type: Date,
    default: Date.now
  },
  statutoryLapseDate: {
    type: Date // e.g. 12 months from Sec 11 to Sec 19
  },
  affectedVillages: [{ type: String }],
  totalAreaHectares: {
    type: Number,
    required: true
  },
  totalKhasrasCovered: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Gazette Published', 'Objections Under Review', 'Lapsed', 'Completed'],
    default: 'Gazette Published'
  },
  issuedBy: {
    type: String,
    required: true
  },
  documentUrl: {
    type: String,
    default: '/documents/gazette_sample.pdf'
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
