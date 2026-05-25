const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:    { type: DataTypes.INTEGER },
  user_email: { type: DataTypes.STRING(150) },
  action:     { type: DataTypes.STRING(100), allowNull: false },
  resource:   { type: DataTypes.STRING(100) },
  details:    { type: DataTypes.TEXT },
  ip_address: { type: DataTypes.STRING(45) },
  user_agent: { type: DataTypes.TEXT },
  status:     { type: DataTypes.ENUM('success', 'failed', 'warning'), defaultValue: 'success' },
}, { tableName: 'audit_logs', updatedAt: false, underscored: true });

module.exports = AuditLog;
