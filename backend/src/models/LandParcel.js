const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sharePercentage: { type: Number, default: 100 },
  aadhaarMasked: { type: String, default: 'XXXX-XXXX-1234' },
  panNumber: { type: String },
  bankDetails: {
    accountNumber: { type: String },
    ifscCode: { type: String },
    bankName: { type: String }
  },
  contactPhone: { type: String }
}, { _id: false });

const landParcelSchema = new mongoose.Schema({
  parcelId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  projectId: {
    type: String,
    ref: 'Project',
    required: true,
    index: true
  },
  projectName: { type: String },
  surveyNumber: {
    type: String,
    required: true,
    trim: true
  },
  khasraNumber: {
    type: String,
    trim: true
  },
  state: { type: String, required: true, index: true },
  district: { type: String, required: true, index: true },
  tehsil: { type: String, required: true },
  village: { type: String, required: true },
  landCategory: {
    type: String,
    enum: [
      'Private Agricultural (Irrigated)',
      'Private Agricultural (Unirrigated)',
      'Private Non-Agricultural / Commercial',
      'Government / Gaon Sabha',
      'Forest Land'
    ],
    default: 'Private Agricultural (Irrigated)'
  },
  area: { type: Number, required: true }, // in Hectares
  totalAreaHectares: { type: Number },
  acquiredAreaHectares: { type: Number },
  circleRatePerHectare: { type: Number, default: 3500000 },
  marketValuePerHectare: { type: Number, default: 4200000 },
  acquisitionStatus: {
    type: String,
    enum: [
      'Proposed',
      'Under Verification',
      'Notification Issued',
      'Awarded',
      'Compensation Paid',
      'Possession Taken',
      'R&R Pending',
      'Completed',
      // Legacy backward-compatibility aliases
      'SIA Survey Complete',
      'Sec 11 Notified',
      'Disputed / In Court',
      'Award Determined',
      'Disbursed',
      'Possession Transferred'
    ],
    default: 'Proposed',
    index: true
  },
  latitude: { type: Number },
  longitude: { type: Number },
  // GeoJSON Polygon
  geometry: {
    type: {
      type: String,
      enum: ['Polygon', 'Point', 'MultiPolygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: Array,
      required: true
    }
  },
  owners: [ownerSchema],
  affectedFamilyReference: {
    familyId: { type: String },
    familyHeadName: { type: String },
    vulnerabilityCategory: { type: String },
    aadhaarMasked: { type: String }
  },
  compensation: {
    amount: { type: Number, default: 0 },
    solatiumAmount: { type: Number, default: 0 },
    additionalInterestAmount: { type: Number, default: 0 },
    totalPayable: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Assessed', 'Sanctioned', 'Paid', 'Disputed'],
      default: 'Pending'
    },
    disbursedDate: { type: Date },
    utrNumber: { type: String },
    bankAccountMasked: { type: String }
  },
  possession: {
    status: {
      type: String,
      enum: ['Not Taken', 'Notice Served', 'Possession Taken', 'Handed Over'],
      default: 'Not Taken'
    },
    possessionDate: { type: Date },
    certificateNumber: { type: String }, // e.g. FORM-11-2024-001
    officerInCharge: { type: String }
  },
  rrStatus: {
    status: {
      type: String,
      enum: ['Not Applicable', 'Pending Allotment', 'House Allotted', 'Grant Paid', 'Settled'],
      default: 'Not Applicable'
    },
    schemeName: { type: String },
    houseAllotted: { type: Boolean, default: false },
    subsistenceGrantPaid: { type: Boolean, default: false }
  },
  gisAttributes: {
    centroid: {
      lat: { type: Number },
      lng: { type: Number }
    },
    encroachmentRisk: {
      type: String,
      enum: ['None', 'Low', 'High'],
      default: 'None'
    },
    treesCount: { type: Number, default: 0 },
    structuresCount: { type: Number, default: 0 },
    jointMeasurementSurveyDone: { type: Boolean, default: false },
    surveyDate: { type: Date }
  }
}, {
  timestamps: true
});

// Auto-sync aliases before saving
landParcelSchema.pre('save', function(next) {
  if (!this.surveyNumber && this.khasraNumber) this.surveyNumber = this.khasraNumber;
  if (!this.khasraNumber && this.surveyNumber) this.khasraNumber = this.surveyNumber;
  if (!this.area) this.area = this.acquiredAreaHectares || this.totalAreaHectares || 1.0;
  if (!this.acquiredAreaHectares) this.acquiredAreaHectares = this.area;
  if (!this.totalAreaHectares) this.totalAreaHectares = this.area;
  if (!this.latitude && this.gisAttributes?.centroid?.lat) this.latitude = this.gisAttributes.centroid.lat;
  if (!this.longitude && this.gisAttributes?.centroid?.lng) this.longitude = this.gisAttributes.centroid.lng;
  next();
});

module.exports = mongoose.model('LandParcel', landParcelSchema);
