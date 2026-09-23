const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getAuditLogs);
router.get('/logs', authenticate, getAuditLogs);

module.exports = router;
