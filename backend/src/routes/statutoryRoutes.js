const express = require('express');
const router = express.Router();
const { getStatutoryTimeline, publishSection11, fileObjection, issueSection19 } = require('../controllers/statutoryController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/roles');

router.get('/:projectId', getStatutoryTimeline);

router.post(
  '/section-11/publish',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.DISTRICT_AUTHORITY_OFFICER, ROLES.STATE_GOV_OFFICER, ROLES.LAND_ACQUISITION_OFFICER),
  publishSection11
);

router.post('/objection', authenticate, fileObjection);

router.post(
  '/section-19/declare',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.STATE_GOV_OFFICER, ROLES.DISTRICT_AUTHORITY_OFFICER),
  issueSection19
);

module.exports = router;
