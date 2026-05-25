const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      order: [['created_at', 'DESC']],
    });
    return res.json({ success: true, data: logs });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return res.status(500).json({ success: false, message: 'Error interno del servidor al obtener logs de auditoría' });
  }
};

module.exports = { getAuditLogs };