const memoryStore = require('../config/inMemoryStore');
const AuditLog = require('../models/AuditLog');
const { isMongo } = require('../config/db');

const logAction = async ({ user, action, resourceType, resourceId, description, metadata = {}, ip = '127.0.0.1' }) => {
  const logEntry = {
    userId: user ? (user._id || user.id) : null,
    userName: user ? user.name : 'System / Guest',
    userRole: user ? user.role : 'GUEST',
    action,
    resourceType,
    resourceId: resourceId ? resourceId.toString() : null,
    description,
    metadata,
    ipAddress: ip,
    timestamp: new Date()
  };

  try {
    if (isMongo()) {
      await AuditLog.create(logEntry);
    }
    // Always append to memory store for quick local retrieval
    memoryStore.addAuditLog(logEntry);
  } catch (err) {
    console.error('Failed to persist audit log:', err.message);
  }
};

module.exports = {
  logAction
};
