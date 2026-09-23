const jwt = require('jsonwebtoken');
const memoryStore = require('../config/inMemoryStore');
const User = require('../models/User');
const { isMongo } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'bhoomisetu_super_secure_jwt_secret_2026';

const authenticate = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing. Please log in.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    let user = null;
    if (isMongo()) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = memoryStore.findUserById(decoded.id) || memoryStore.findUserByEmail(decoded.email);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session or user not found.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
      error: err.message
    });
  }
};

module.exports = {
  authenticate,
  JWT_SECRET
};
