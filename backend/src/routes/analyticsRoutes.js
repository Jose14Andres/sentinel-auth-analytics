const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const audit = require('../middleware/auditMiddleware');
const {
  getSummary, getChartData, getCategories, createRecord, getRecords, getMyRecords, exportCSV
} = require('../controllers/analyticsController');

// Lectura: admin, analyst, auditor (NO operator)
router.get('/summary',    authenticate, authorize('dashboard:read'), getSummary);
router.get('/chart',      authenticate, authorize('dashboard:read'), getChartData);
router.get('/records',    authenticate, authorize('data:read'),      getRecords);
router.get('/categories', authenticate,                              getCategories);

// Lectura: solo operator (o quien tenga data:read)
router.get('/my-records', authenticate, authorize('data:read'),      getMyRecords);

// Export CSV: admin only
// Note: Only admin has '*', so any permission that is not in any other role will be admin only.
// Let's use an obscure permission name or check if the middleware supports special cases. Let's use a non-existent permission which only admin has via '*'.
router.get('/export-csv', authenticate, authorize('admin:only'), audit('EXPORT_CSV', 'analytics'), exportCSV);

// Escritura: solo operator y admin
router.post('/records', authenticate, authorize('data:write'), audit('DATA_CREATE', 'analytics'), createRecord);

module.exports = router;
