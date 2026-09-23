const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  documentId: {
    type: String,
    required: true,
    unique: true
  }, // e.g. "DOC-2026-001"
  projectId: {
    type: String,
    required: true,
    ref: 'Project'
  },
  title: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    enum: [
      'Gazette Notification (Sec 11)',
      'Statutory Declaration (Sec 19)',
      'Social Impact Assessment (SIA) Report',
      'Section 23 Award Ledger',
      'Form 11 Possession Certificate',
      'PFMS DBT Disbursal Mandate',
      'Cabinet / Ministry Sanction',
      'Environmental Clearance',
      'Joint Measurement Survey (JMS) Sheet'
    ],
    required: true
  },
  statutorySection: {
    type: String
  }, // e.g. "Section 11(1)", "Section 23"
  fileNumber: {
    type: String
  },
  fileSize: {
    type: String,
    default: '2.4 MB'
  },
  fileUrl: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified Official', 'Archived'],
    default: 'Verified Official'
  },
  sha256Hash: {
    type: String,
    default: () => 'SHA256:' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
