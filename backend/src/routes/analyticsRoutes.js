const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const audit = require('../middleware/auditMiddleware');
const {
  getSummary, getChartData, getCategories, createRecord, getRecords
} = require('../controllers/analyticsController');

// Lectura: admin, analyst, auditor (NO operator)
router.get('/summary',    authenticate, authorize('dashboard:read'), getSummary);
router.get('/chart',      authenticate, authorize('dashboard:read'), getChartData);
router.get('/records',    authenticate, authorize('data:read'),      getRecords);
router.get('/categories', authenticate,                              getCategories);

// Escritura: solo operator y admin
router.post('/records', authenticate, authorize('data:write'), audit('DATA_CREATE', 'analytics'), createRecord);

module.exports = router;
