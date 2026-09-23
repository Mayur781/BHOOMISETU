const memoryStore = require('../config/inMemoryStore');

// GET /api/v1/audit/logs
const getAuditLogs = async (req, res) => {
  try {
    const { action, resourceType, limit = 100 } = req.query;
    let logs = memoryStore.getAuditLogs(Number(limit));

    if (action) {
      logs = logs.filter(l => l.action === action);
    }
    if (resourceType) {
      logs = logs.filter(l => l.resourceType === resourceType);
    }

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.', error: err.message });
  }
};

module.exports = {
  getAuditLogs
};
