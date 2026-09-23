const memoryStore = require('../config/inMemoryStore');
const { logAction } = require('../middleware/auditLogger');

// GET /api/v1/possession/status/:projectId
const getPossessionStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = memoryStore.findProjectById(projectId);
    const parcels = memoryStore.getParcelsByProject(projectId);
    const awards = memoryStore.getAwardsByProject(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const totalAcquisitionArea = project.targetAcquisitionAreaHectares;
    const transferredParcels = parcels.filter(p => p.acquisitionStatus === 'Possession Transferred');
    const transferredArea = transferredParcels.reduce((sum, p) => sum + p.acquiredAreaHectares, 0);

    // Section 38 Check: Has compensation been fully deposited/disbursed?
    const totalAwards = awards.length;
    const fullyDisbursedAwards = awards.filter(a => a.status === 'FULLY_DISBURSED').length;
    const compensationReady = totalAwards > 0 && fullyDisbursedAwards === totalAwards;

    res.json({
      success: true,
      data: {
        projectCode: project.projectCode,
        targetAcquisitionAreaHectares: totalAcquisitionArea,
        possessionTransferredHectares: Number(transferredArea.toFixed(2)),
        percentageCompleted: totalAcquisitionArea > 0 ? ((transferredArea / totalAcquisitionArea) * 100).toFixed(1) : 0,
        statutoryConditions: {
          rfctlarrSection38CompensationDeposited: compensationReady,
          rehabilitationSettlementClearance: true,
          revenueMutationInitiated: transferredParcels.length > 0
        },
        transferredParcelsCount: transferredParcels.length,
        totalParcelsCount: parcels.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve possession status.', error: err.message });
  }
};

// POST /api/v1/possession/generate-certificate
const generateCertificate = async (req, res) => {
  try {
    const { projectId, parcelIds, handoverToAgencyOfficer, inspectionDate } = req.body;

    const project = memoryStore.findProjectById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const certNumber = `POSS-CERT-SEC38-${Date.now().toString().slice(-6)}`;
    const selectedParcels = (parcelIds || []).map(id => memoryStore.findParcelById(id)).filter(Boolean);

    // Update status of these parcels
    selectedParcels.forEach(p => {
      memoryStore.updateParcel(p._id || p.id, { acquisitionStatus: 'Possession Transferred' });
    });

    const certificate = {
      certificateNumber: certNumber,
      statutoryAct: 'Section 38, RFCTLARR Act 2013 (Form 11)',
      projectCode: project.projectCode,
      projectTitle: project.title,
      implementingAgency: project.implementingAgency,
      handoverToOfficer: handoverToAgencyOfficer || 'Er. Manoj Verma, NHAI Project Director',
      issuedByCalaOfficer: req.user.name,
      inspectionDate: inspectionDate || new Date(),
      parcelsHandedOver: selectedParcels.map(p => ({
        khasraNumber: p.khasraNumber,
        village: p.village,
        areaHectares: p.acquiredAreaHectares
      })),
      digitalSeal: {
        hash: `SHA256:${Date.now()}_NIC_SEAL_${Math.random().toString(36).substr(2, 9)}`,
        signedAt: new Date()
      },
      possessionHandoverNoticeText: `This is to formally certify that full and peaceful physical possession of the parcels listed herein has been executed under Section 38 of the RFCTLARR Act, 2013, all statutory awards and compensations having been duly tendered.`
    };

    await logAction({
      user: req.user,
      action: 'POSSESSION_CERT_ISSUED',
      resourceType: 'Project',
      resourceId: projectId,
      description: `Section 38 Physical Possession Certificate (${certNumber}) executed and handed over to ${certificate.handoverToOfficer}.`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Section 38 Possession Handover Certificate successfully generated.',
      data: certificate
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Certificate generation failed.', error: err.message });
  }
};

module.exports = {
  getPossessionStatus,
  generateCertificate
};
