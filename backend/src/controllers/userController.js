const User = require('../models/User');
const Role = require('../models/Role');

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'is_active', 'last_login', 'created_at'],
      include: [{ model: Role, as: 'role', attributes: ['name', 'description'] }],
      order: [['created_at', 'DESC']],
    });

    // Flatten role name for frontend convenience if needed, but we can just send as is
    return res.json({ success: true, data: users });
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ success: false, message: 'Error interno del servidor al obtener usuarios' });
  }
};

module.exports = { getUsers };