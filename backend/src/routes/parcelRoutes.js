const express = require('express');
const router = express.Router();
const { getParcels, getGeoJSONByProject, createParcel, updateParcel } = require('../controllers/parcelController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/roles');

router.get('/', getParcels);
router.get('/geojson/:projectId', getGeoJSONByProject);

router.post(
  '/',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.LAND_ACQUISITION_OFFICER, ROLES.FIELD_SURVEY_OFFICER, ROLES.PROJECT_AGENCY_OFFICER),
  createParcel
);

router.put(
  '/:id',
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.LAND_ACQUISITION_OFFICER, ROLES.FIELD_SURVEY_OFFICER, ROLES.DISTRICT_AUTHORITY_OFFICER),
  updateParcel
);

module.exports = router;
