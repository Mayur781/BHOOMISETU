const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  updateStatus,
  assignOfficer,
  advanceStage
} = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/roles');

router.get('/', getProjects);
router.get('/:id', getProjectById);

// Creation allowed by Super Admin, Ministry, State Gov, and Implementing Agency
router.post(
  '/',
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.CENTRAL_MINISTRY_OFFICER,
    ROLES.STATE_GOV_OFFICER,
    ROLES.PROJECT_AGENCY_OFFICER
  ),
  createProject
);

// Update project particulars
router.put(
  '/:id',
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.CENTRAL_MINISTRY_OFFICER,
    ROLES.STATE_GOV_OFFICER,
    ROLES.PROJECT_AGENCY_OFFICER,
    ROLES.LAND_ACQUISITION_OFFICER
  ),
  updateProject
);

// Update status
router.patch(
  '/:id/status',
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.CENTRAL_MINISTRY_OFFICER,
    ROLES.STATE_GOV_OFFICER,
    ROLES.DISTRICT_AUTHORITY_OFFICER,
    ROLES.LAND_ACQUISITION_OFFICER
  ),
  updateStatus
);

// Assign Officer (Super Admin, Ministry, State Gov, District Authority)
router.post(
  '/:id/assign-officer',
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.CENTRAL_MINISTRY_OFFICER,
    ROLES.STATE_GOV_OFFICER,
    ROLES.DISTRICT_AUTHORITY_OFFICER
  ),
  assignOfficer
);

// Advancing statutory stages
router.post(
  '/:id/advance-stage',
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.DISTRICT_AUTHORITY_OFFICER,
    ROLES.LAND_ACQUISITION_OFFICER,
    ROLES.STATE_GOV_OFFICER
  ),
  advanceStage
);

module.exports = router;
