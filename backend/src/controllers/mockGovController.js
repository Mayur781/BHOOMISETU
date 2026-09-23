// Mock API Integration Interfaces for Indian National e-Governance Systems
// Designed with identical contract signatures to live MoRTH, Bhulekh, and PFMS APIs

// GET /api/v1/mock-gov/bhulekh/khasra/:khasraNumber
const lookupBhulekhRoR = (req, res) => {
  const { khasraNumber } = req.params;
  const { state = 'Maharashtra', district = 'Thane', village = 'Padgha' } = req.query;

  // Realistic mock Record of Rights (RoR / 7/12 extract)
  res.json({
    success: true,
    provider: 'National Land Records Modernization Programme (NLRMP) / Bhulekh API',
    data: {
      khasraNumber,
      village,
      district,
      state,
      khataNumber: 'KH-9041',
      totalAreaBigha: 3.85,
      totalAreaHectares: 2.10,
      landClass: 'Jirayat (Dry Crop) Agricultural',
      recordedOwners: [
        {
          name: 'Shri Rameshwar Tukaram Patil',
          fatherOrHusbandName: 'Tukaram Patil',
          shareRatio: '6/10',
          mutationNumber: 'MUT-2018-0914'
        },
        {
          name: 'Smt. Shantabai Rameshwar Patil',
          fatherOrHusbandName: 'Rameshwar Patil',
          shareRatio: '4/10',
          mutationNumber: 'MUT-2018-0914'
        }
      ],
      encumbrances: [
        {
          type: 'Kisan Credit Card Crop Hypothecation',
          bank: 'State Bank of India',
          amountINR: 150000,
          status: 'Active (To be settled via CALA Escrow)'
        }
      ],
      verificationTimestamp: new Date().toISOString(),
      digitalSignSeal: 'MAHA-BHULEKH-DIGICERT-V3-OK'
    }
  });
};

// POST /api/v1/mock-gov/pfms/validate-account
const validatePFMSAccount = (req, res) => {
  const { accountNumber, ifscCode, ownerName } = req.body;

  if (!accountNumber || !ifscCode) {
    return res.status(400).json({ success: false, message: 'accountNumber and ifscCode are required.' });
  }

  // Realistic PFMS Public Financial Management System validation response
  res.json({
    success: true,
    provider: 'PFMS (Public Financial Management System) DBT Beneficiary Validation',
    data: {
      accountNumber,
      ifscCode,
      bankName: ifscCode.startsWith('SBIN') ? 'State Bank of India' : ifscCode.startsWith('BARB') ? 'Bank of Baroda' : 'Nationalized Bank',
      accountStatus: 'VALID_ACTIVE',
      aadhaarSeeded: true,
      nameMatchedPercentage: 98.5,
      dbtReady: true,
      pfmsBeneficiaryCode: `PFMS-BEN-${Date.now().toString().slice(-8)}`
    }
  });
};

// GET /api/v1/mock-gov/digilocker/gazette/:notificationNumber
const verifyGazette = (req, res) => {
  const { notificationNumber } = req.params;

  res.json({
    success: true,
    provider: 'e-Gazette Govt of India / DigiLocker Verification API',
    data: {
      notificationNumber,
      authority: 'Government of India, Ministry of Road Transport and Highways',
      gazetteCategory: 'Extraordinary Gazette Part II - Section 3 - Sub-section (ii)',
      publicationDate: '2024-10-12',
      issuingSecretary: 'Joint Secretary (Land Acquisition)',
      tamperCheckHash: 'SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      isVerifiedAuthentic: true
    }
  });
};

module.exports = {
  lookupBhulekhRoR,
  validatePFMSAccount,
  verifyGazette
};
