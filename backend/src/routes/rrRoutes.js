const express = require('express');
const router = express.Router();
const { getAffectedFamilies, enrollFamily, settleEntitlement } = require('../controllers/rrController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/roles');

router.get('/families/:projectId', getAffectedFamilies);

router.post(
  '/families',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.LAND_ACQUISITION_OFFICER, ROLES.FIELD_SURVEY_OFFICER),
  enrollFamily
);

router.put(
  '/families/:id/settle',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.LAND_ACQUISITION_OFFICER, ROLES.DISTRICT_AUTHORITY_OFFICER),
  settleEntitlement
);

module.exports = router;
