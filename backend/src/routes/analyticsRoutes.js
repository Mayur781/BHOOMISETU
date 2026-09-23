const express = require('express');
const router = express.Router();
const { getExecutiveSummary } = require('../controllers/analyticsController');

router.get('/executive-summary', getExecutiveSummary);

module.exports = router;
