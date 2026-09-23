const mongoose = require('mongoose');

const possessionSchema = new mongoose.Schema({
  possessionCertificateNumber: {
    type: String,
    required: true,
    unique: true
  }, // e.g. "FORM-11-THN-2026-088"
  projectId: {
    type: String,
    required: true,
    ref: 'Project'
  },
  section38NoticeDate: {
    type: Date,
    required: true
  },
  physicalPossessionDate: {
    type: Date
  },
  handoverToAgencyDate: {
    type: Date
  },
  khasraNumbersCovered: [{ type: String }],
  totalAreaHandedOverHectares: {
    type: Number,
    required: true
  },
  encroachmentsCleared: {
    type: Boolean,
    default: true
  },
  encumbranceFreeCertificateIssued: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: [
      'Notice Issued',
      'Physical Possession Taken by State',
      'Handed Over to Implementing Agency',
      'Disputed'
    ],
    default: 'Physical Possession Taken by State'
  },
  officerInCharge: {
    type: String,
    required: true // CALA / Executive Magistrate
  },
  agencyRepresentative: {
    type: String,
    required: true // Project Director, PIU
  },
  form11CertificateUrl: {
    type: String,
    default: '/documents/form11_possession_sample.pdf'
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Possession', possessionSchema);
