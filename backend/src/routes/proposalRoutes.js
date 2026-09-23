const express = require('express');
const router = express.Router();
const {
  getProposals,
  getProposalById,
  createProposal,
  submitProposal,
  verifyProposal,
  approveProposal,
  rejectProposal
} = require('../controllers/proposalController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/roles');

router.get('/', getProposals);
router.get('/:id', getProposalById);

// Creation allowed by Agency, Ministry, State, and Super Admin
router.post(
  '/',
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.PROJECT_AGENCY_OFFICER,
    ROLES.CENTRAL_MINISTRY_OFFICER,
    ROLES.STATE_GOV_OFFICER
  ),
  createProposal
);

// Submit proposal: Draft -> Submitted
router.post(
  '/:id/submit',
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.PROJECT_AGENCY_OFFICER,
    ROLES.CENTRAL_MINISTRY_OFFICER
  ),
  submitProposal
);

// District verification (District Authority Officer / Collector)
router.post(
  '/:id/verify',
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.DISTRICT_AUTHORITY_OFFICER
  ),
  verifyProposal
);

// Approve proposal (State Gov, Central Ministry, District Authority, Super Admin)
router.post(
  '/:id/approve',
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.CENTRAL_MINISTRY_OFFICER,
    ROLES.STATE_GOV_OFFICER,
    ROLES.DISTRICT_AUTHORITY_OFFICER
  ),
  approveProposal
);

// Reject proposal
router.post(
  '/:id/reject',
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.CENTRAL_MINISTRY_OFFICER,
    ROLES.STATE_GOV_OFFICER,
    ROLES.DISTRICT_AUTHORITY_OFFICER
  ),
  rejectProposal
);

module.exports = router;
