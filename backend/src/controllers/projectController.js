const memoryStore = require('../config/inMemoryStore');
const Project = require('../models/Project');
const { isMongo } = require('../config/db');
const { logAction } = require('../middleware/auditLogger');

// GET /api/v1/projects
const getProjects = async (req, res) => {
  try {
    const { sector, projectType, state, status, currentStage, search } = req.query;
    const typeFilter = projectType || sector;

    if (isMongo()) {
      const query = {};
      if (typeFilter) {
        query.$or = [{ projectType: typeFilter }, { sector: typeFilter }];
      }
      if (state) {
        query.$or = [{ state: state }, { statesCovered: state }];
      }
      if (status) query.status = status;
      if (currentStage) query.currentStage = currentStage;
      if (search) {
        query.$or = [
          { projectName: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { projectId: { $regex: search, $options: 'i' } },
          { projectCode: { $regex: search, $options: 'i' } },
          { implementingAgency: { $regex: search, $options: 'i' } }
        ];
      }
      const projects = await Project.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: projects.length, data: projects });
    }

    const projects = memoryStore.getAllProjects({
      projectType: typeFilter,
      state,
      status,
      currentStage,
      search
    });

    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve projects.', error: err.message });
  }
};

// GET /api/v1/projects/:id
// Returns complete relational aggregate data powering all 12 project dossier tabs
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    // Retrieve full aggregate from memoryStore
    const aggregate = memoryStore.getProjectAggregate(id);

    if (!aggregate || !aggregate.project) {
      if (isMongo()) {
        const proj = await Project.findById(id);
        if (proj) {
          return res.json({ success: true, data: proj });
        }
      }
      return res.status(404).json({ success: false, message: 'Project not found in national registry.' });
    }

    res.json({
      success: true,
      data: {
        ...aggregate.project,
        proposal: aggregate.proposal,
        landParcels: aggregate.landParcels,
        notifications: aggregate.notifications,
        awards: aggregate.awards,
        compensations: aggregate.compensations,
        affectedFamilies: aggregate.affectedFamilies,
        possessions: aggregate.possessions,
        rrCases: aggregate.rrCases,
        documents: aggregate.documents,
        milestones: aggregate.milestones,
        auditLogs: aggregate.auditLogs,
        stats: aggregate.stats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve project dossier.', error: err.message });
  }
};

// POST /api/v1/projects
const createProject = async (req, res) => {
  try {
    const {
      projectId,
      projectCode,
      projectName,
      title,
      description,
      ministry,
      implementingAgency,
      projectType,
      sector,
      state,
      district,
      tehsil,
      village,
      totalProjectArea,
      requiredLandArea,
      targetAcquisitionAreaHectares,
      estimatedBudgetCrores,
      estimatedCostInCrores,
      startDate,
      expectedCompletionDate
    } = req.body;

    const pCode = projectId || projectCode || `PRJ-${Date.now().toString(36).toUpperCase()}`;
    const name = projectName || title;
    const type = projectType || sector || 'Highway';
    const landReq = Number(requiredLandArea || targetAcquisitionAreaHectares || 100);

    if (!name || !state || !district || !landReq) {
      return res.status(400).json({
        success: false,
        message: 'Missing mandatory fields: projectName, state, district, requiredLandArea are required.'
      });
    }

    const defaultMilestones = [
      {
        stage: 'PROPOSAL_SUBMISSION',
        title: 'Alignment Proposal Submitted',
        statutoryCode: 'Sec 3(A)',
        targetDate: new Date(Date.now() + 30 * 86400000),
        status: 'COMPLETED',
        approvedBy: req.user?.name || 'Authorized Officer'
      },
      {
        stage: 'SECTION_4_SIA',
        title: 'Social Impact Assessment Study',
        statutoryCode: 'Sec 4(1)',
        targetDate: new Date(Date.now() + 180 * 86400000),
        status: 'IN_PROGRESS'
      },
      {
        stage: 'SECTION_11_PRELIM_NOTIFICATION',
        title: 'Preliminary Notification & Gazette',
        statutoryCode: 'Sec 11(1)',
        targetDate: new Date(Date.now() + 365 * 86400000),
        status: 'PENDING'
      },
      {
        stage: 'SECTION_15_OBJECTIONS_HEARING',
        title: 'Hearing of Objections by CALA',
        statutoryCode: 'Sec 15(2)',
        targetDate: new Date(Date.now() + 425 * 86400000),
        status: 'PENDING'
      },
      {
        stage: 'SECTION_19_DECLARATION',
        title: 'Statutory Declaration of Acquisition',
        statutoryCode: 'Sec 19(1)',
        targetDate: new Date(Date.now() + 545 * 86400000),
        status: 'PENDING'
      },
      {
        stage: 'SECTION_23_AWARD_DETERMINATION',
        title: 'Enquiry and Land Acquisition Award',
        statutoryCode: 'Sec 23 & 30',
        targetDate: new Date(Date.now() + 730 * 86400000),
        status: 'PENDING'
      },
      {
        stage: 'SECTION_38_POSSESSION_HANDOVER',
        title: 'Physical Possession Handover',
        statutoryCode: 'Sec 38',
        targetDate: new Date(Date.now() + 900 * 86400000),
        status: 'PENDING'
      }
    ];

    const projectData = {
      projectId: pCode,
      projectCode: pCode,
      projectName: name,
      title: name,
      description: description || 'National infrastructure corridor under BhoomiSetu.',
      projectType: type,
      sector: type,
      ministry: ministry || 'Ministry of Road Transport and Highways (MoRTH)',
      implementingAgency: implementingAgency || 'National Highways Authority of India (NHAI)',
      state,
      district,
      tehsil: tehsil || 'Central',
      village: village || 'Sector-1',
      statesCovered: [state],
      districtsCovered: [district],
      tehsilsCovered: [tehsil || 'Central'],
      villagesCovered: [village || 'Sector-1'],
      totalProjectArea: Number(totalProjectArea || landReq * 1.2),
      requiredLandArea: landReq,
      targetAcquisitionAreaHectares: landReq,
      acquiredLandArea: 0,
      acquiredAreaHectares: 0,
      estimatedBudgetCrores: Number(estimatedBudgetCrores || estimatedCostInCrores || 250),
      estimatedCostInCrores: Number(estimatedBudgetCrores || estimatedCostInCrores || 250),
      status: 'Active Acquisition',
      currentStage: 'PROPOSAL_SUBMITTED',
      startDate: startDate || new Date(),
      expectedCompletionDate: expectedCompletionDate || new Date(Date.now() + 730 * 86400000),
      statutoryMilestones: defaultMilestones,
      createdBy: req.user?._id || req.user?.id
    };

    let newProject;
    if (isMongo()) {
      newProject = await Project.create(projectData);
    } else {
      newProject = memoryStore.createProject(projectData);
    }

    // Automatically create accompanying proposal in memory
    memoryStore.createProposal({
      proposalId: `PROP-${Date.now().toString(36).toUpperCase()}`,
      projectId: pCode,
      projectName: name,
      projectType: type,
      sponsoringAgency: implementingAgency || 'Implementing Agency',
      state,
      district,
      tehsil: tehsil || 'Central',
      villages: [village || 'Sector-1'],
      requiredAreaHectares: landReq,
      estimatedCostInCrores: Number(estimatedBudgetCrores || estimatedCostInCrores || 250),
      justification: description || 'Mandatory public purpose corridor.',
      status: 'Submitted',
      submittedDate: new Date(),
      submittedBy: {
        userId: req.user?._id || req.user?.id,
        name: req.user?.name || 'Project Director',
        designation: req.user?.designation || 'Agency Lead'
      }
    });

    await logAction({
      user: req.user,
      action: 'PROJECT_CREATED',
      resourceType: 'Project',
      resourceId: pCode,
      description: `New project corridor registered: ${name} (${pCode}) with required land ${landReq} Ha.`,
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully in National Registry.',
      data: newProject
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create project.', error: err.message });
  }
};

// PUT /api/v1/projects/:id
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    let project = memoryStore.findProjectById(id);

    if (!project && isMongo()) {
      project = await Project.findById(id);
    }

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const allowedUpdates = [
      'projectName',
      'title',
      'description',
      'projectType',
      'sector',
      'ministry',
      'implementingAgency',
      'totalProjectArea',
      'requiredLandArea',
      'targetAcquisitionAreaHectares',
      'acquiredLandArea',
      'acquiredAreaHectares',
      'estimatedBudgetCrores',
      'estimatedCostInCrores',
      'startDate',
      'expectedCompletionDate',
      'actualCompletionDate'
    ];

    const updateData = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const updated = memoryStore.updateProject(project._id || project.id, updateData);

    await logAction({
      user: req.user,
      action: 'PROJECT_UPDATED',
      resourceType: 'Project',
      resourceId: project.projectId || project.projectCode || id,
      description: `Project particulars updated for ${project.projectName || project.title}.`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Project particulars updated successfully.',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update project.', error: err.message });
  }
};

// PATCH /api/v1/projects/:id/status
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, currentStage, remarks } = req.body;

    let project = memoryStore.findProjectById(id);
    if (!project && isMongo()) {
      project = await Project.findById(id);
    }

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (currentStage) updateData.currentStage = currentStage;

    const updated = memoryStore.updateProject(project._id || project.id, updateData);

    await logAction({
      user: req.user,
      action: 'STATUS_UPDATED',
      resourceType: 'Project',
      resourceId: project.projectId || project.projectCode || id,
      description: `Project status updated to '${status || project.status}', stage '${currentStage || project.currentStage}'. Remarks: ${remarks || 'None'}`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Project status updated successfully.',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update project status.', error: err.message });
  }
};

// POST /api/v1/projects/:id/assign-officer
const assignOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleType, officerId, officerName } = req.body;

    if (!roleType || !officerName) {
      return res.status(400).json({
        success: false,
        message: 'roleType (e.g. CALA, DISTRICT_AUTHORITY, SURVEYOR) and officerName are required.'
      });
    }

    let project = memoryStore.findProjectById(id);
    if (!project && isMongo()) {
      project = await Project.findById(id);
    }

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const assignedOfficers = { ...(project.assignedOfficers || {}) };

    if (roleType === 'CALA' || roleType === 'LAND_ACQUISITION_OFFICER') {
      assignedOfficers.calaOfficerId = officerId;
      assignedOfficers.calaOfficerName = officerName;
    } else if (roleType === 'DISTRICT_AUTHORITY' || roleType === 'COLLECTOR') {
      assignedOfficers.districtOfficerId = officerId;
      assignedOfficers.districtOfficerName = officerName;
    } else if (roleType === 'SURVEYOR' || roleType === 'FIELD_SURVEY_OFFICER') {
      assignedOfficers.surveyorOfficerId = officerId;
      assignedOfficers.surveyorOfficerName = officerName;
    }

    const updated = memoryStore.updateProject(project._id || project.id, { assignedOfficers });

    await logAction({
      user: req.user,
      action: 'OFFICER_ASSIGNED',
      resourceType: 'Project',
      resourceId: project.projectId || project.projectCode || id,
      description: `Officer assigned to corridor: ${officerName} as ${roleType}.`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: `${roleType} officer successfully assigned to project.`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to assign officer.', error: err.message });
  }
};

// POST /api/v1/projects/:id/advance-stage
const advanceStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { nextStage, remarks } = req.body;

    const STAGE_FLOW = [
      'PROPOSAL_SUBMITTED',
      'SIA_INITIATED',
      'SIA_APPROVED',
      'SECTION_11_NOTIFIED',
      'SECTION_15_OBJECTIONS_REVIEWED',
      'SECTION_19_DECLARED',
      'SECTION_23_AWARD_PASSED',
      'COMPENSATION_DISBURSED',
      'RR_SETTLED',
      'POSSESSION_TAKEN'
    ];

    let project = memoryStore.findProjectById(id);
    if (!project && isMongo()) {
      project = await Project.findById(id);
    }

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const currentIdx = STAGE_FLOW.indexOf(project.currentStage);
    const targetStage = nextStage || STAGE_FLOW[currentIdx + 1];

    if (!targetStage || STAGE_FLOW.indexOf(targetStage) === -1) {
      return res.status(400).json({ success: false, message: 'Invalid target stage or project is already at final possession stage.' });
    }

    const updated = memoryStore.updateProject(project._id || project.id, {
      currentStage: targetStage
    });

    await logAction({
      user: req.user,
      action: 'STAGE_ADVANCE',
      resourceType: 'Project',
      resourceId: project.projectId || project.projectCode || id,
      description: `Project stage advanced from ${project.currentStage} to ${targetStage}. Remarks: ${remarks || 'Statutory criteria met.'}`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: `Project transitioned to ${targetStage}`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Stage advance failed.', error: err.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  updateStatus,
  assignOfficer,
  advanceStage
};
