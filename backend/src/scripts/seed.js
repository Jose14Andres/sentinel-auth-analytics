require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const User = require('../models/User');
const Role = require('../models/Role');

async function seed() {
  await sequelize.authenticate();
  const hash = await bcrypt.hash('Admin1234!', 12);
  console.log('Hash generado:', hash);

  await User.update({ password_hash: hash }, { where: {} });
  console.log('Todos los usuarios actualizados con hash correcto');
  process.exit(0);
}
seed().catch(e => { console.error(e); process.exit(1); });
