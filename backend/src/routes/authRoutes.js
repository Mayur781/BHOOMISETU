const express = require('express');
const router = express.Router();
const {
  login,
  getMe,
  getDemoUsers,
  switchRole,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', authenticate, getMe);
router.get('/demo-users', getDemoUsers);
router.post('/switch-role', switchRole);
router.put('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);

module.exports = router;
