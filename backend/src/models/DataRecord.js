const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DataCategory = sequelize.define('DataCategory', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT },
}, { tableName: 'data_categories', timestamps: false });

const DataRecord = sequelize.define('DataRecord', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  category_id: { type: DataTypes.INTEGER, allowNull: false },
  title:       { type: DataTypes.STRING(200), allowNull: false },
  value:       { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  unit:        { type: DataTypes.STRING(50) },
  period:      { type: DataTypes.STRING(20), allowNull: false },
  region:      { type: DataTypes.STRING(100) },
  notes:       { type: DataTypes.TEXT },
  created_by:  { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'data_records', underscored: true, updatedAt: false });

DataRecord.belongsTo(DataCategory, { foreignKey: 'category_id', as: 'category' });

module.exports = { DataRecord, DataCategory };
