const router = require('express').Router();
const { login, me, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const audit = require('../middleware/auditMiddleware');

router.post('/login',  audit('LOGIN', 'auth'),  login);
router.get('/me',      authenticate,            me);
router.post('/logout', authenticate, audit('LOGOUT', 'auth'), logout);

module.exports = router;
