const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const audit = require('../middleware/auditMiddleware');
const {
  getAll, getById, create, update, remove, getSummary
} = require('../controllers/risksController');

router.get('/',        authenticate, authorize('risks:read'), getAll);
router.get('/summary', authenticate, authorize('risks:read'), getSummary);
router.get('/:id',     authenticate, authorize('risks:read'), getById);

router.post('/',       authenticate, authorize('risks:write'), audit('RISK_CREATE', 'risks'), create);
router.put('/:id',     authenticate, authorize('risks:write'), audit('RISK_UPDATE', 'risks'), update);
router.delete('/:id',  authenticate, authorize('risks:write'), audit('RISK_DELETE', 'risks'), remove);

module.exports = router;
