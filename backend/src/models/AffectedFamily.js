const mongoose = require('mongoose');

const affectedFamilySchema = new mongoose.Schema({
  familyRegistrationId: {
    type: String,
    required: true,
    unique: true
  },
  projectId: {
    type: String,
    required: true,
    ref: 'Project'
  },
  familyHeadName: {
    type: String,
    required: true,
    trim: true
  },
  vulnerabilityCategory: {
    type: String,
    enum: [
      'Scheduled Tribe (ST)',
      'Scheduled Caste (SC)',
      'Below Poverty Line (BPL)',
      'Marginal Farmer (< 1 Ha)',
      'Agricultural Labourer / Tenant',
      'Artisan / Rural Craftsman',
      'General'
    ],
    required: true
  },
  membersCount: {
    type: Number,
    required: true,
    default: 4
  },
  village: { type: String, required: true },
  district: { type: String, required: true },
  khasraNumber: { type: String },
  lossCategory: {
    type: String,
    enum: [
      'Homestead & Agricultural Land Displaced',
      'Only Homestead Displaced',
      'Only Agricultural Land Acquired',
      'Livelihood Loss Without Land'
    ],
    required: true
  },
  entitlements: {
    houseAllocated: { type: Boolean, default: false },
    resettlementSiteName: { type: String, default: 'PM Awas R&R Enclave' },
    subsistenceGrantAmount: { type: Number, default: 36000 }, // ₹3,000/mo for 1 yr (Second Sched)
    subsistencePaid: { type: Boolean, default: false },
    transportationAllowance: { type: Number, default: 50000 },
    transportationPaid: { type: Boolean, default: false },
    oneTimeResettlementAllowance: { type: Number, default: 50000 },
    resettlementAllowancePaid: { type: Boolean, default: false },
    rehabilitationLivelihoodOption: {
      type: String,
      enum: [
        'One-time Lump Sum Grant (₹5,00,000)',
        'Project Employment / Contractor Role',
        'Monthly Annuity (₹2,000/mo for 20 yrs)'
      ],
      default: 'One-time Lump Sum Grant (₹5,00,000)'
    },
    livelihoodSettled: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['SURVEYED', 'R_AND_R_APPROVED', 'RESETTLEMENT_IN_PROGRESS', 'FULLY_REHABILITATED'],
    default: 'SURVEYED'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AffectedFamily', affectedFamilySchema);
