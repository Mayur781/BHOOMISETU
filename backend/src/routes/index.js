const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const proposalRoutes = require('./proposalRoutes');
const projectRoutes = require('./projectRoutes');
const parcelRoutes = require('./parcelRoutes');
const statutoryRoutes = require('./statutoryRoutes');
const compensationRoutes = require('./compensationRoutes');
const rrRoutes = require('./rrRoutes');
const possessionRoutes = require('./possessionRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const auditRoutes = require('./auditRoutes');
const mockGovRoutes = require('./mockGovRoutes');
const gisRoutes = require('./gisRoutes');

router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'UP',
    system: 'BhoomiSetu - National Land Acquisition & Management System',
    version: '1.0.0',
    statutoryFramework: 'RFCTLARR Act, 2013',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/proposals', proposalRoutes);
router.use('/parcels', parcelRoutes);
router.use('/gis', gisRoutes);
router.use('/statutory', statutoryRoutes);
router.use('/compensation', compensationRoutes);
router.use('/rr', rrRoutes);
router.use('/possession', possessionRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/audit', auditRoutes);
router.use('/mock-gov', mockGovRoutes);

module.exports = router;
