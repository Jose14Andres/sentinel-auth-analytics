const router = require('express').Router();
const { getUsers } = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

// Custom middleware to restrict to admin only, or we can use authorize from RBAC
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Acceso denegado. Se requiere rol de administrador.' });
};

router.get('/', authenticate, requireAdmin, getUsers);

module.exports = router;