const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token requerido' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, { include: [{ model: Role, as: 'role' }] });
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Usuario inactivo o no encontrado' });
    }
    req.user = { id: user.id, name: user.name, email: user.email, role: user.role.name };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Sesión expirada. Inicia sesión nuevamente.' });
    }
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }
};

module.exports = { authenticate };
