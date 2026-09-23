const express = require('express');
const router = express.Router();
const { lookupBhulekhRoR, validatePFMSAccount, verifyGazette } = require('../controllers/mockGovController');

router.get('/bhulekh/khasra/:khasraNumber', lookupBhulekhRoR);
router.post('/pfms/validate-account', validatePFMSAccount);
router.get('/digilocker/gazette/:notificationNumber', verifyGazette);

module.exports = router;
