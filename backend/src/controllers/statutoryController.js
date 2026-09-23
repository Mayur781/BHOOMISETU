const memoryStore = require('../config/inMemoryStore');
const { STATUTORY_LIMITS } = require('../config/constants');
const { logAction } = require('../middleware/auditLogger');

// GET /api/v1/statutory/:projectId
const getStatutoryTimeline = async (req, res) => {
  try {
    const { projectId } = req.params;
    const stages = memoryStore.getStagesByProject(projectId);
    const project = memoryStore.findProjectById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    res.json({
      success: true,
      data: {
        projectCode: project.projectCode,
        currentStage: project.currentStage,
        statutoryLimits: STATUTORY_LIMITS,
        stages
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve statutory timeline.', error: err.message });
  }
};

// POST /api/v1/statutory/section-11/publish
const publishSection11 = async (req, res) => {
  try {
    const { projectId, notificationNumber, newspaperHindi, newspaperEnglish, stateGazetteRef } = req.body;

    if (!projectId || !notificationNumber) {
      return res.status(400).json({ success: false, message: 'projectId and notificationNumber are required.' });
    }

    const stageData = {
      projectId,
      stageCode: 'SEC_11_PRELIM_NOTIFICATION',
      stageTitle: 'Section 11 Preliminary Notification & Gazette',
      status: 'PUBLISHED',
      initiatedDate: new Date(),
      statutoryDeadlineDate: new Date(Date.now() + 365 * 86400000), // 12-month statutory window under Sec 14
      completedDate: new Date(),
      gazetteDetails: {
        notificationNumber,
        publicationDate: new Date(),
        newspaperHindi: newspaperHindi || 'Dainik Jagran',
        newspaperEnglish: newspaperEnglish || 'The Times of India',
        stateOfficialGazetteRef: stateGazetteRef || 'Official State Gazette Part IV'
      },
      officerRemarks: `Section 11 Preliminary Notification promulgated under authority of Collector / DM. Land transactions frozen.`
    };

    const newStage = memoryStore.createStage(stageData);

    // Update project stage
    memoryStore.updateProject(projectId, { currentStage: 'SECTION_11_NOTIFIED' });

    // Mark parcels as Sec 11 Notified
    const parcels = memoryStore.getParcelsByProject(projectId);
    parcels.forEach(p => {
      if (p.acquisitionStatus === 'Proposed' || p.acquisitionStatus === 'SIA Survey Complete') {
        memoryStore.updateParcel(p._id || p.id, { acquisitionStatus: 'Sec 11 Notified' });
      }
    });

    await logAction({
      user: req.user,
      action: 'SECTION_11_PUBLISHED',
      resourceType: 'StatutoryStage',
      resourceId: newStage._id || newStage.id,
      description: `Section 11 Gazette published (${notificationNumber}). Land transactions frozen across project corridor.`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Section 11 Preliminary Notification published in Gazette.',
      data: newStage
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to publish Section 11.', error: err.message });
  }
};

// POST /api/v1/statutory/objection
const fileObjection = async (req, res) => {
  try {
    const { stageId, petitionerName, khasraNumber, objectionType, description } = req.body;

    const stage = memoryStore.findStageById(stageId);
    if (!stage) {
      return res.status(404).json({ success: false, message: 'Statutory stage not found.' });
    }

    const newObjection = {
      _id: 'obj_' + Date.now(),
      petitionerName,
      khasraNumber,
      objectionType: objectionType || 'Measurement / Boundary Error',
      description,
      hearingDate: new Date(Date.now() + 7 * 86400000),
      status: 'PENDING',
      resolutionRemarks: ''
    };

    stage.objections = stage.objections || [];
    stage.objections.push(newObjection);
    memoryStore.updateStage(stageId, { objections: stage.objections });

    await logAction({
      user: req.user,
      action: 'OBJECTION_FILED',
      resourceType: 'StatutoryStage',
      resourceId: stageId,
      description: `Section 15 Objection filed by ${petitionerName} for Khasra ${khasraNumber}.`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Objection recorded successfully. Hearing date scheduled.',
      data: newObjection
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to file objection.', error: err.message });
  }
};

// POST /api/v1/statutory/section-19/declare
const issueSection19 = async (req, res) => {
  try {
    const { projectId, declarationNumber, stateGazetteRef } = req.body;

    const stageData = {
      projectId,
      stageCode: 'SEC_19_DECLARATION',
      stageTitle: 'Section 19 Declaration of Acquisition & Resettlement Area',
      status: 'PUBLISHED',
      initiatedDate: new Date(),
      statutoryDeadlineDate: new Date(Date.now() + 365 * 86400000), // 12-month statutory clock to Award under Sec 25
      completedDate: new Date(),
      gazetteDetails: {
        notificationNumber: declarationNumber || 'DECL-RFCTLARR-2026-99',
        publicationDate: new Date(),
        newspaperHindi: 'Lokmat',
        newspaperEnglish: 'Indian Express',
        stateOfficialGazetteRef: stateGazetteRef || 'Official State Gazette Part I-A'
      },
      officerRemarks: 'Conclusive declaration under Section 19(1) that land is required for public infrastructure purpose.'
    };

    const newStage = memoryStore.createStage(stageData);
    memoryStore.updateProject(projectId, { currentStage: 'SECTION_19_DECLARED' });

    await logAction({
      user: req.user,
      action: 'SECTION_19_DECLARED',
      resourceType: 'StatutoryStage',
      resourceId: newStage._id || newStage.id,
      description: `Section 19 Final Declaration promulgated (${declarationNumber}). Statutory 12-month clock to Section 23 Award initiated.`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Section 19 Declaration published.',
      data: newStage
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to issue Section 19.', error: err.message });
  }
};

module.exports = {
  getStatutoryTimeline,
  publishSection11,
  fileObjection,
  issueSection19
};
