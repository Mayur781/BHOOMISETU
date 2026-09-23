const express = require('express');
const router = express.Router();
const { getPossessionStatus, generateCertificate } = require('../controllers/possessionController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/roles');

router.get('/status/:projectId', getPossessionStatus);

router.post(
  '/generate-certificate',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.LAND_ACQUISITION_OFFICER, ROLES.DISTRICT_AUTHORITY_OFFICER),
  generateCertificate
);

module.exports = router;
