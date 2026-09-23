const memoryStore = require('../config/inMemoryStore');
const { logAction } = require('../middleware/auditLogger');

// GET /api/v1/rr/families/:projectId
const getAffectedFamilies = async (req, res) => {
  try {
    const { projectId } = req.params;
    const families = memoryStore.getFamiliesByProject(projectId);

    // Summary breakdown
    const vulnerabilityCounts = {};
    let totalSubsistenceDisbursed = 0;
    let housesAllocatedCount = 0;

    families.forEach(f => {
      vulnerabilityCounts[f.vulnerabilityCategory] = (vulnerabilityCounts[f.vulnerabilityCategory] || 0) + 1;
      if (f.entitlements?.houseAllocated) housesAllocatedCount++;
      if (f.entitlements?.subsistencePaid) totalSubsistenceDisbursed += (f.entitlements.subsistenceGrantAmount || 36000);
    });

    res.json({
      success: true,
      data: {
        totalFamilies: families.length,
        housesAllocatedCount,
        totalSubsistenceDisbursedINR: totalSubsistenceDisbursed,
        vulnerabilityCounts,
        families
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve affected families.', error: err.message });
  }
};

// POST /api/v1/rr/families
const enrollFamily = async (req, res) => {
  try {
    const {
      projectId,
      familyHeadName,
      vulnerabilityCategory,
      membersCount,
      village,
      district,
      lossCategory
    } = req.body;

    if (!projectId || !familyHeadName || !village) {
      return res.status(400).json({ success: false, message: 'projectId, familyHeadName, and village are required.' });
    }

    const regId = `PAF-${Date.now().toString().slice(-6)}`;
    const familyData = {
      projectId,
      familyHeadName,
      familyRegistrationId: regId,
      vulnerabilityCategory: vulnerabilityCategory || 'Marginal Farmer (< 1 Ha)',
      membersCount: Number(membersCount || 4),
      village,
      district: district || 'Thane',
      lossCategory: lossCategory || 'Homestead & Agricultural Land Displaced',
      entitlements: {
        houseAllocated: false,
        resettlementSiteName: 'Padgha Model R&R Colony Sector 2',
        subsistenceGrantAmount: 36000, // ₹3,000 / mo as per RFCTLARR Second Schedule
        subsistencePaid: false,
        transportationAllowance: 50000,
        transportationPaid: false,
        oneTimeResettlementAllowance: 50000,
        resettlementAllowancePaid: false,
        rehabilitationLivelihoodOption: 'One-time Lump Sum Grant (₹5,00,000)',
        livelihoodSettled: false
      },
      status: 'SURVEYED'
    };

    const newFamily = memoryStore.createFamily(familyData);

    await logAction({
      user: req.user,
      action: 'PAF_ENROLLED',
      resourceType: 'AffectedFamily',
      resourceId: newFamily._id || newFamily.id,
      description: `Project Affected Family enrolled (${regId}) - ${familyHeadName} (${vulnerabilityCategory}).`,
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Affected family enrolled under RFCTLARR R&R scheme.',
      data: newFamily
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Enrollment failed.', error: err.message });
  }
};

// PUT /api/v1/rr/families/:id/settle-entitlement
const settleEntitlement = async (req, res) => {
  try {
    const { id } = req.params;
    const { entitlementKey } = req.body; // e.g. 'houseAllocated', 'subsistencePaid', 'livelihoodSettled'

    const family = memoryStore.affectedFamilies.find(f => f._id === id || f.id === id);
    if (!family) {
      return res.status(404).json({ success: false, message: 'Family not found.' });
    }

    family.entitlements = family.entitlements || {};
    family.entitlements[entitlementKey] = true;

    // Check if all major entitlements settled
    if (family.entitlements.houseAllocated && family.entitlements.subsistencePaid && family.entitlements.livelihoodSettled) {
      family.status = 'FULLY_REHABILITATED';
    } else {
      family.status = 'RESETTLEMENT_IN_PROGRESS';
    }

    await logAction({
      user: req.user,
      action: 'RR_ENTITLEMENT_SETTLED',
      resourceType: 'AffectedFamily',
      resourceId: id,
      description: `R&R Entitlement '${entitlementKey}' marked settled for family ${family.familyHeadName} (${family.familyRegistrationId}).`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: `Entitlement ${entitlementKey} settled.`,
      data: family
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update entitlement.', error: err.message });
  }
};

module.exports = {
  getAffectedFamilies,
  enrollFamily,
  settleEntitlement
};
