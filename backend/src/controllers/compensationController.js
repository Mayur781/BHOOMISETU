const memoryStore = require('../config/inMemoryStore');
const { logAction } = require('../middleware/auditLogger');
const { RFCTLARR_FACTORS } = require('../config/constants');

// POST /api/v1/compensation/calculate-preview
// Pure deterministic RFCTLARR Act 2013 Sections 26-30 arithmetic engine
const calculateRFCTLARR = (req, res) => {
  try {
    const {
      areaHectares,
      marketRatePerHectare,
      ruralMultiplierFactor = 1.25,
      structuresValue = 0,
      treesCropsValue = 0,
      monthsFromSIA = 12
    } = req.body;

    if (!areaHectares || !marketRatePerHectare) {
      return res.status(400).json({
        success: false,
        message: 'areaHectares and marketRatePerHectare are mandatory parameters.'
      });
    }

    const area = Number(areaHectares);
    const rate = Number(marketRatePerHectare);
    const multiplier = Math.min(Math.max(Number(ruralMultiplierFactor), 1.0), 2.0);
    const structures = Number(structuresValue || 0);
    const trees = Number(treesCropsValue || 0);
    const months = Number(monthsFromSIA || 12);

    // Section 26: Base Market Value
    const baseLandMarketValue = Math.round(area * rate);

    // Section 26(2) First Schedule: Multiplied Land Value
    const multipliedLandValue = Math.round(baseLandMarketValue * multiplier);

    // Section 29: Total Assets Attached to Land
    const totalAssetsValue = structures + trees;

    // Section 30(1): 100% Solatium
    // Solatium of 100% is computed on (multiplied land value + assets attached)
    const solatiumBasis = multipliedLandValue + totalAssetsValue;
    const solatiumAmount = Math.round(solatiumBasis * (RFCTLARR_FACTORS.SOLATIUM_PERCENTAGE / 100));

    // Section 30(3): 12% per annum Additional Compensation
    // Calculated on the base market value from the date of preliminary notification/SIA to award date
    const annualRate = RFCTLARR_FACTORS.ADDITIONAL_INTEREST_RATE_ANNUAL / 100;
    const additionalInterestAmount = Math.round(baseLandMarketValue * annualRate * (months / 12));

    // Total Award Amount payable under Section 23
    const totalCompensationPayable = multipliedLandValue + totalAssetsValue + solatiumAmount + additionalInterestAmount;

    res.json({
      success: true,
      data: {
        inputs: {
          areaHectares: area,
          marketRatePerHectare: rate,
          ruralMultiplierFactor: multiplier,
          structuresValue: structures,
          treesCropsValue: trees,
          monthsFromSIA: months
        },
        breakdown: {
          baseLandMarketValue,
          ruralUrbanMultiplierFactor: multiplier,
          multipliedLandValue,
          assetsValueStructures: structures,
          assetsValueTreesCrops: trees,
          totalAssetsValue,
          solatiumPercentage: RFCTLARR_FACTORS.SOLATIUM_PERCENTAGE,
          solatiumAmount,
          additionalInterestRateAnnual: RFCTLARR_FACTORS.ADDITIONAL_INTEREST_RATE_ANNUAL,
          additionalInterestAmount,
          totalCompensationPayable
        },
        statutoryNotes: [
          'Section 26: Determined higher of circle rate, average sale deeds, or agreed price.',
          `Section 26(2): Multiplier factor of ${multiplier}x applied based on distance from nearest urban agglomeration.`,
          'Section 29: Independent PWD / Forest Dept valuation of structures and standing timber/horticulture.',
          'Section 30(1): Mandatory 100% Solatium on land and attached immovable assets.',
          `Section 30(3): 12% per annum interest accrued for ${months} months statutory duration.`
        ]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Calculation failed.', error: err.message });
  }
};

// GET /api/v1/compensation/project/:projectId
const getAwardsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const awards = memoryStore.getAwardsByProject(projectId);

    // Calculate aggregated project disbursal stats
    const totalSanctioned = awards.reduce((sum, a) => sum + (a.calculation?.totalCompensationPayable || 0), 0);
    const totalDisbursed = awards.reduce((sum, a) => {
      const disbursedShares = (a.disbursements || [])
        .filter(d => d.paymentStatus === 'DISBURSED_SUCCESS')
        .reduce((dSum, d) => dSum + d.amountShare, 0);
      return sum + disbursedShares;
    }, 0);

    res.json({
      success: true,
      data: {
        totalSanctionedINR: totalSanctioned,
        totalDisbursedINR: totalDisbursed,
        disbursalPercentage: totalSanctioned > 0 ? ((totalDisbursed / totalSanctioned) * 100).toFixed(1) : 0,
        awards
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve awards.', error: err.message });
  }
};

// POST /api/v1/compensation/award
// Formal award passing under Section 23
const passAward = async (req, res) => {
  try {
    const { projectId, parcelId, calculation } = req.body;

    const parcel = memoryStore.findParcelById(parcelId);
    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    const awardNumber = `CALA/AWD/${Date.now().toString().slice(-6)}`;
    const disbursements = (parcel.owners || []).map(owner => ({
      ownerName: owner.name,
      bankAccount: owner.bankDetails?.accountNumber || '38194019280',
      ifscCode: owner.bankDetails?.ifscCode || 'SBIN0001824',
      bankName: owner.bankDetails?.bankName || 'State Bank of India',
      amountShare: Math.round((calculation.totalCompensationPayable * (owner.sharePercentage || 100)) / 100),
      paymentStatus: 'PFMS_QUEUED',
      utrNumber: `PFMS${Date.now()}`
    }));

    const awardData = {
      projectId,
      parcelId,
      awardNumber,
      dateOfAward: new Date(),
      calculation,
      disbursements,
      status: 'APPROVED_BY_CALA',
      calaDigitalSignature: {
        officerName: req.user.name,
        digitalHash: `SHA256:${Math.random().toString(36).substring(2)}${Date.now()}`,
        signedAt: new Date()
      }
    };

    const newAward = memoryStore.createAward(awardData);

    // Update parcel status
    memoryStore.updateParcel(parcelId, { acquisitionStatus: 'Award Determined' });

    await logAction({
      user: req.user,
      action: 'AWARD_DETERMINED',
      resourceType: 'AwardCompensation',
      resourceId: newAward._id || newAward.id,
      description: `Section 23 Award passed (${awardNumber}) for Khasra ${parcel.khasraNumber}. Total compensation: ₹${(calculation.totalCompensationPayable / 10000000).toFixed(2)} Cr.`,
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: `Section 23 Award passed successfully (${awardNumber}).`,
      data: newAward
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to pass award.', error: err.message });
  }
};

// POST /api/v1/compensation/disburse
// Simulates PFMS Direct Benefit Transfer (DBT)
const disburseCompensation = async (req, res) => {
  try {
    const { awardId, disbursementIndex } = req.body;

    const awards = memoryStore.awardCompensations;
    const award = awards.find(a => a._id === awardId || a.id === awardId);

    if (!award) {
      return res.status(404).json({ success: false, message: 'Award not found.' });
    }

    const idx = disbursementIndex !== undefined ? Number(disbursementIndex) : 0;
    if (!award.disbursements[idx]) {
      return res.status(400).json({ success: false, message: 'Disbursement record not found.' });
    }

    const utr = `PFMS${Date.now()}${Math.floor(Math.random() * 1000)}`;
    award.disbursements[idx].paymentStatus = 'DISBURSED_SUCCESS';
    award.disbursements[idx].utrNumber = utr;
    award.disbursements[idx].disbursedAt = new Date();

    // Check if all disbursements for this award are completed
    const allDone = award.disbursements.every(d => d.paymentStatus === 'DISBURSED_SUCCESS');
    if (allDone) {
      award.status = 'FULLY_DISBURSED';
      // Mark parcel as Disbursed
      if (award.parcelId) {
        memoryStore.updateParcel(award.parcelId, { acquisitionStatus: 'Disbursed' });
      }
    }

    await logAction({
      user: req.user,
      action: 'PFMS_DBT_DISBURSED',
      resourceType: 'AwardCompensation',
      resourceId: awardId,
      description: `Direct Benefit Transfer of ₹${award.disbursements[idx].amountShare.toLocaleString('en-IN')} credited to ${award.disbursements[idx].ownerName} (UTR: ${utr}).`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'DBT Compensation disbursed successfully via PFMS gateway.',
      data: {
        award,
        disbursedRecord: award.disbursements[idx]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Disbursement failed.', error: err.message });
  }
};

module.exports = {
  calculateRFCTLARR,
  getAwardsByProject,
  passAward,
  disburseCompensation
};
