// RFCTLARR Act 2013 Statutory Constants & SLA Timelines

const STATUTORY_LIMITS = {
  // Section 14: Time limit for publishing Section 11 after SIA report approval (12 months)
  SIA_TO_SECTION_11_DAYS: 365,
  // Section 15: Statutory window for filing and hearing objections (60 days)
  SECTION_15_OBJECTIONS_WINDOW_DAYS: 60,
  // Section 25: Strict statutory limit between Sec 19 Declaration and Sec 23 Award (12 months)
  SECTION_19_TO_AWARD_DAYS: 365,
  // Section 38: Period for depositing compensation prior to taking possession
  COMPENSATION_DEPOSIT_DAYS: 90
};

const RFCTLARR_FACTORS = {
  // Section 30(1): 100% Solatium over determined market value + assets
  SOLATIUM_PERCENTAGE: 100,
  // Section 30(3): 12% per annum additional compensation from SIA publication to award date
  ADDITIONAL_INTEREST_RATE_ANNUAL: 12,
  // Section 26(2) First Schedule: Rural Multiplier Factor range (1.0x to 2.0x based on distance from urban area)
  RURAL_FACTOR_MIN: 1.0,
  RURAL_FACTOR_MAX: 2.0,
  URBAN_FACTOR: 1.0
};

const SECTORS = [
  'Highways & Roads',
  'Railways & Freight',
  'Renewable Energy',
  'Port & Inland Waterways',
  'Urban Infrastructure',
  'Industrial Corridor'
];

const STATES = [
  'Maharashtra',
  'Gujarat',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Rajasthan',
  'Haryana',
  'Karnataka',
  'Tamil Nadu',
  'Andhra Pradesh',
  'Telangana',
  'Odisha',
  'Bihar',
  'West Bengal'
];

module.exports = {
  STATUTORY_LIMITS,
  RFCTLARR_FACTORS,
  SECTORS,
  STATES
};
