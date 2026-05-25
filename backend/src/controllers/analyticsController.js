const { DataRecord, DataCategory } = require('../models/DataRecord');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// GET /api/analytics/summary — KPIs para dashboard
const getSummary = async (req, res) => {
  try {
    const [ingresos, gastos, incidentes, disponibilidad] = await Promise.all([
      DataRecord.sum('value', { where: { category_id: 1 } }),
      DataRecord.sum('value', { where: { category_id: 2 } }),
      DataRecord.sum('value', { where: { category_id: 3 } }),
      DataRecord.findOne({
        where: { category_id: 4 },
        order: [['created_at', 'DESC']],
        attributes: ['value'],
      }),
    ]);
    res.json({
      success: true,
      data: {
        total_ingresos:    parseFloat(ingresos || 0),
        total_gastos:      parseFloat(gastos || 0),
        utilidad:          parseFloat((ingresos || 0) - (gastos || 0)),
        total_incidentes:  parseInt(incidentes || 0),
        disponibilidad:    parseFloat(disponibilidad?.value || 0),
        total_registros:   await DataRecord.count(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/chart?category_id=1 — datos para gráfico de líneas
const getChartData = async (req, res) => {
  try {
    const { category_id } = req.query;
    const where = category_id ? { category_id: parseInt(category_id) } : {};
    const records = await DataRecord.findAll({
      where,
      include: [{ model: DataCategory, as: 'category', attributes: ['name'] }],
      order: [['period', 'ASC']],
    });
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/categories
const getCategories = async (req, res) => {
  try {
    const cats = await DataCategory.findAll();
    res.json({ success: true, data: cats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/analytics/records — solo operator y admin
const createRecord = async (req, res) => {
  try {
    const { category_id, title, value, unit, period, region, notes } = req.body;
    if (!category_id || !title || !value || !period) {
      return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
    }
    const record = await DataRecord.create({
      category_id, title, value, unit, period, region, notes,
      created_by: req.user.id,
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/records — tabla de datos
const getRecords = async (req, res) => {
  try {
    const records = await DataRecord.findAll({
      include: [{ model: DataCategory, as: 'category', attributes: ['name'] }],
      order: [['created_at', 'DESC']],
      limit: 100,
    });
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getSummary, getChartData, getCategories, createRecord, getRecords };
