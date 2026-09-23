const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const memoryStore = require('../config/inMemoryStore');
const { isMongo } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');
const { logAction } = require('../middleware/auditLogger');
const { ROLE_DETAILS, ROLE_PERMISSIONS } = require('../config/roles');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Format user payload for client
const formatUserPayload = (user) => {
  const userObj = user.toJSON ? user.toJSON() : { ...user };
  delete userObj.password;
  return {
    ...userObj,
    roleDetails: ROLE_DETAILS[user.role] || { name: user.role, badge: user.role },
    permissions: ROLE_PERMISSIONS[user.role] || []
  };
};

// POST /api/v1/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    let user = null;
    let isMatch = false;

    if (isMongo()) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        isMatch = await user.comparePassword(password);
      }
    } else {
      user = memoryStore.findUserByEmail(email);
      if (user) {
        isMatch = await bcrypt.compare(password, user.password);
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const token = generateToken(user);

    // Record login audit log
    await logAction({
      user,
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user._id || user.id,
      description: `User ${user.name} logged in with statutory role ${user.role}.`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: formatUserPayload(user)
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Authentication server error.',
      error: err.message
    });
  }
};

// GET /api/v1/auth/me
const getMe = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      data: {
        user: formatUserPayload(user)
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile.',
      error: err.message
    });
  }
};

// GET /api/v1/auth/demo-users
// Exposes the 8 pre-seeded roles for rapid 1-click evaluator role-switching
const getDemoUsers = async (req, res) => {
  const demoUsers = memoryStore.users.map(u => ({
    id: u._id || u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    designation: u.designation,
    department: u.department,
    roleDetails: ROLE_DETAILS[u.role] || { name: u.role, badge: u.role },
    permissions: ROLE_PERMISSIONS[u.role] || []
  }));

  res.json({
    success: true,
    data: { demoUsers }
  });
};

// POST /api/v1/auth/switch-role
// 1-Click Role Switch for prototype evaluation
const switchRole = async (req, res) => {
  try {
    const { role } = req.body;
    let targetUser = memoryStore.users.find(u => u.role === role);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: `Demo user for role ${role} not found.`
      });
    }

    const token = generateToken(targetUser);

    res.json({
      success: true,
      message: `Switched role to ${ROLE_DETAILS[targetUser.role]?.name || targetUser.role}`,
      data: {
        token,
        user: formatUserPayload(targetUser)
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Role switch failed.',
      error: err.message
    });
  }
};

// PUT /api/v1/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { designation, department, phone } = req.body;
    const userId = req.user._id || req.user.id;

    if (isMongo()) {
      const updated = await User.findByIdAndUpdate(
        userId,
        { designation, department, phone },
        { new: true, runValidators: true }
      ).select('-password');
      return res.json({
        success: true,
        message: 'Profile updated successfully.',
        data: { user: formatUserPayload(updated) }
      });
    } else {
      const user = memoryStore.findUserById(userId);
      if (user) {
        if (designation) user.designation = designation;
        if (department) user.department = department;
        if (phone) user.phone = phone;
      }
      return res.json({
        success: true,
        message: 'Profile updated successfully.',
        data: { user: formatUserPayload(user || req.user) }
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Profile update failed.',
      error: err.message
    });
  }
};

// POST /api/v1/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both currentPassword and newPassword are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const userId = req.user._id || req.user.id;
    let user = isMongo() ? await User.findById(userId) : memoryStore.findUserById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match records.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    user.password = newHash;
    if (isMongo()) {
      await user.save();
    }

    await logAction({
      user: req.user,
      action: 'PASSWORD_CHANGED',
      resourceType: 'User',
      resourceId: userId,
      description: `Security credentials updated by officer ${req.user.name}.`,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Password updated successfully.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Password update failed.',
      error: err.message
    });
  }
};

module.exports = {
  login,
  getMe,
  getDemoUsers,
  switchRole,
  updateProfile,
  changePassword
};
