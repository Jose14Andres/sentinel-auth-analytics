const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Risk = sequelize.define('Risk', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING(100)
  },
  probability: {
    type: DataTypes.ENUM('baja', 'media', 'alta', 'muy_alta'),
    allowNull: false
  },
  impact: {
    type: DataTypes.ENUM('bajo', 'medio', 'alto', 'critico'),
    allowNull: false
  },
  level: {
    type: DataTypes.ENUM('bajo', 'medio', 'alto', 'critico')
    // Note: Generated columns in Sequelize might need some special handling, but we can map it as readonly or just define it
    // Setting it as VIRTUAL or ignoring it in creation is fine since it's GENERATED ALWAYS AS ... STORED
  },
  mitigation: {
    type: DataTypes.TEXT
  },
  responsible: {
    type: DataTypes.STRING(100)
  },
  status: {
    type: DataTypes.ENUM('activo', 'mitigado', 'aceptado'),
    defaultValue: 'activo'
  },
  created_by: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  tableName: 'risks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true
});

Risk.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

module.exports = Risk;
