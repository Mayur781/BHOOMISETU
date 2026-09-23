const express = require('express');
const router = express.Router();
const {
  calculateRFCTLARR,
  getAwardsByProject,
  passAward,
  disburseCompensation
} = require('../controllers/compensationController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/roles');

// Pure calculation preview (open to all authenticated officers)
router.post('/calculate-preview', authenticate, calculateRFCTLARR);

router.get('/project/:projectId', getAwardsByProject);

router.post(
  '/award',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.LAND_ACQUISITION_OFFICER, ROLES.DISTRICT_AUTHORITY_OFFICER),
  passAward
);

router.post(
  '/disburse',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.LAND_ACQUISITION_OFFICER, ROLES.PROJECT_AGENCY_OFFICER),
  disburseCompensation
);

module.exports = router;
