const AuditLog = require('../models/AuditLog');

const audit = (action, resource) => async (req, res, next) => {
  const originalSend = res.json.bind(res);
  res.json = async (data) => {
    const status = res.statusCode >= 400 ? 'failed' : 'success';
    try {
      await AuditLog.create({
        user_id:    req.user?.id   || null,
        user_email: req.user?.email || req.body?.email || 'anonymous',
        action,
        resource,
        details: JSON.stringify({ method: req.method, body: sanitize(req.body), response_status: res.statusCode }),
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.headers['user-agent'],
        status,
      });
    } catch (e) { console.error('Audit log error:', e.message); }
    return originalSend(data);
  };
  next();
};

function sanitize(body) {
  if (!body) return {};
  const safe = { ...body };
  if (safe.password) safe.password = '[REDACTED]';
  return safe;
}

module.exports = audit;
