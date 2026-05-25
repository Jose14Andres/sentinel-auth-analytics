const router = require('express').Router();
const { getAuditLogs } = require('../controllers/auditController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');

router.get('/logs', authenticate, authorize('audit:read'), getAuditLogs);

module.exports = router;