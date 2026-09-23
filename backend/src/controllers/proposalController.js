const memoryStore = require('../config/inMemoryStore');
const Proposal = require('../models/Proposal');
const { isMongo } = require('../config/db');
const { logAction } = require('../middleware/auditLogger');
const { ROLES } = require('../config/roles');

// GET /api/v1/proposals
const getProposals = async (req, res) => {
  try {
    const { status, projectId } = req.query;

    if (isMongo()) {
      const query = {};
      if (status) query.status = status;
      if (projectId) query.projectId = projectId;
      const proposals = await Proposal.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: proposals.length, data: proposals });
    }

    const proposals = memoryStore.getAllProposals({ status, projectId });
    res.json({ success: true, count: proposals.length, data: proposals });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve proposals.', error: err.message });
  }
};

// GET /api/v1/proposals/:id
const getProposalById = async (req, res) => {
  try {
    const { id } = req.params;
    let proposal;

    if (isMongo()) {
      proposal = await Proposal.findById(id);
    } else {
      proposal = memoryStore.findProposalById(id) || memoryStore.findProposalByProjectId(id);
    }

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found.' });
    }

    res.json({ success: true, data: proposal });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve proposal.', error: err.message });
  }
};

// POST /api/v1/proposals
const createProposal = async (req, res) => {
  try {
    const {
      projectId,
      projectName,
      projectType,
      sponsoringAgency,
      state,
      district,
      tehsil,
      villages,
      requiredAreaHectares,
      estimatedCostInCrores,
      justification
    } = req.body;

    if (!projectName || !state || !district || !requiredAreaHectares || !estimatedCostInCrores) {
      return res.status(400).json({
        success: false,
        message: 'Missing mandatory proposal fields: projectName, state, district, requiredAreaHectares, estimatedCostInCrores.'
      });
    }

    const proposalId = `PROP-${Date.now().toString(36).toUpperCase()}`;
    const pId = projectId || `PRJ-${Date.now().toString(36).toUpperCase()}`;

    const proposalData = {
      proposalId,
      projectId: pId,
      projectName,
      projectType: projectType || 'Highway',
      sponsoringAgency: sponsoringAgency || req.user?.department || 'Implementing Agency',
      state,
      district,
      tehsil: tehsil || 'Central',
      villages: Array.isArray(villages) ? villages : [villages || 'Main Sector'],
      requiredAreaHectares: Number(requiredAreaHectares),
      estimatedCostInCrores: Number(estimatedCostInCrores),
      justification: justification || 'Statutory infrastructure project proposal.',
      status: 'Draft',
      submittedBy: {
        userId: req.user?._id || req.user?.id,
        name: req.user?.name || 'Authorized Agency Officer',
        designation: req.user?.designation || 'Project Director'
      }
    };

    let newProposal;
    if (isMongo()) {
      newProposal = await Proposal.create(proposalData);
    } else {
      newProposal = memoryStore.createProposal(proposalData);
    }

    await logAction({
      user: req.user,
      action: 'PROPOSAL_CREATED',
      resourceType: 'Proposal',
      resourceId: newProposal.proposalId,
      description: `Draft proposal ${newProposal.proposalId} created for ${projectName}.`,
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Proposal draft created successfully.',
      data: newProposal
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create proposal.', error: err.message });
  }
};

// POST /api/v1/proposals/:id/submit
// Transition: Draft -> Submitted
const submitProposal = async (req, res) => {
  try {
    const { id } = req.params;
    let proposal = memoryStore.findProposalById(id) || memoryStore.findProposalByProjectId(id);

    if (!proposal && isMongo()) {
      proposal = await Proposal.findById(id);
    }

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found.' });
    }

    if (proposal.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot submit proposal in '${proposal.status}' status. Only 'Draft' proposals can be submitted.`
      });
    }

    const updated = memoryStore.updateProposal(proposal.proposalId, {
      status: 'Submitted',
      submittedDate: new Date(),
      submittedBy: {
        userId: req.user?._id || req.user?.id,
        name: req.user?.name || 'Implementing Agency Officer',
        designation: req.user?.designation || 'Project Director'
      }
    });

    await logAction({
      user: req.user,
      action: 'PROPOSAL_SUBMITTED',
      resourceType: 'Proposal',
      resourceId: proposal.proposalId,
      description: `Proposal ${proposal.proposalId} submitted for District Authority verification.`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Proposal submitted successfully for District verification.',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Proposal submission failed.', error: err.message });
  }
};

// POST /api/v1/proposals/:id/verify
// Transition: Submitted -> District Verification (District Authority / Collector)
const verifyProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { landRecordsStatus, fieldInspectionDone, remarks } = req.body;

    let proposal = memoryStore.findProposalById(id) || memoryStore.findProposalByProjectId(id);

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found.' });
    }

    if (proposal.status !== 'Submitted' && proposal.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Proposal must be in 'Submitted' status to undergo District Verification. Current: ${proposal.status}`
      });
    }

    const districtVerification = {
      verifiedBy: req.user?.name || 'District Magistrate & Collector',
      verificationDate: new Date(),
      landRecordsStatus: landRecordsStatus || '100% verified with District RoR / Bhulekh records',
      fieldInspectionDone: fieldInspectionDone !== undefined ? fieldInspectionDone : true,
      remarks: remarks || 'Land title records and alignment vetted by District Revenue Authority.',
      passed: true
    };

    const updated = memoryStore.updateProposal(proposal.proposalId, {
      status: 'State Review',
      districtVerification
    });

    await logAction({
      user: req.user,
      action: 'PROPOSAL_VERIFIED',
      resourceType: 'Proposal',
      resourceId: proposal.proposalId,
      description: `District verification completed by ${districtVerification.verifiedBy}. Forwarded to State Review.`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Proposal successfully verified by District Authority and forwarded for State Review.',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'District verification failed.', error: err.message });
  }
};

// POST /api/v1/proposals/:id/approve
// Transitions: State Review -> Central Review -> Approved -> Acquisition Initiated
const approveProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks, cabinetSanctionRef } = req.body;

    let proposal = memoryStore.findProposalById(id) || memoryStore.findProposalByProjectId(id);

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found.' });
    }

    let nextStatus = '';
    let updateFields = {};

    if (proposal.status === 'District Verification' || proposal.status === 'Submitted') {
      nextStatus = 'State Review';
      updateFields = {
        stateReview: {
          reviewedBy: req.user?.name || 'Divisional Commissioner',
          reviewDate: new Date(),
          remarks: remarks || 'State government SIA cleared.',
          passed: true
        }
      };
    } else if (proposal.status === 'State Review') {
      nextStatus = 'Central Review';
      updateFields = {
        centralReview: {
          reviewedBy: req.user?.name || 'Central Ministry Officer',
          reviewDate: new Date(),
          remarks: remarks || 'Under national infrastructure vetting.',
          passed: true
        }
      };
    } else if (proposal.status === 'Central Review') {
      nextStatus = 'Approved';
      updateFields = {
        approvedDate: new Date(),
        centralReview: {
          reviewedBy: req.user?.name || 'Central Ministry Officer',
          reviewDate: new Date(),
          cabinetSanctionRef: cabinetSanctionRef || `CCEA-${Date.now().toString(36).toUpperCase()}`,
          remarks: remarks || 'National Ministerial sanction granted.',
          passed: true
        }
      };
    } else if (proposal.status === 'Approved') {
      nextStatus = 'Acquisition Initiated';
      updateFields = {
        acquisitionInitiatedDate: new Date()
      };
      // Also update matching project's status and stage if present
      const proj = memoryStore.findProjectById(proposal.projectId);
      if (proj) {
        memoryStore.updateProject(proj._id || proj.id, {
          status: 'Active Acquisition',
          currentStage: 'SIA_INITIATED'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: `Proposal is already in '${proposal.status}' and cannot be approved further.`
      });
    }

    const updated = memoryStore.updateProposal(proposal.proposalId, {
      status: nextStatus,
      ...updateFields
    });

    await logAction({
      user: req.user,
      action: 'PROPOSAL_APPROVED',
      resourceType: 'Proposal',
      resourceId: proposal.proposalId,
      description: `Proposal ${proposal.proposalId} advanced to '${nextStatus}'. Remarks: ${remarks || 'Approved'}`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: `Proposal successfully progressed to '${nextStatus}'.`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Proposal approval failed.', error: err.message });
  }
};

// POST /api/v1/proposals/:id/reject
// Transition: Any -> Rejected
const rejectProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'A detailed rejection reason is mandatory for statutory transparency.'
      });
    }

    let proposal = memoryStore.findProposalById(id) || memoryStore.findProposalByProjectId(id);

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found.' });
    }

    const updated = memoryStore.updateProposal(proposal.proposalId, {
      status: 'Rejected',
      rejectionReason: reason,
      rejectionDate: new Date()
    });

    await logAction({
      user: req.user,
      action: 'PROPOSAL_REJECTED',
      resourceType: 'Proposal',
      resourceId: proposal.proposalId,
      description: `Proposal ${proposal.proposalId} rejected by ${req.user?.name} (${req.user?.role}). Reason: ${reason}`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Proposal rejected and reason recorded in statutory audit trail.',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Proposal rejection failed.', error: err.message });
  }
};

module.exports = {
  getProposals,
  getProposalById,
  createProposal,
  submitProposal,
  verifyProposal,
  approveProposal,
  rejectProposal
};
