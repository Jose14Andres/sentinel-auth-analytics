const { DataRecord, DataCategory } = require('../models/DataRecord');
const User = require('../models/User');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Asociar DataRecord con User temporalmente para el export
DataRecord.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// GET /api/analytics/summary — KPIs para dashboard
const getSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const periodCondition = {};
    if (from && to) {
      periodCondition.period = { [Op.between]: [from, to] };
    } else if (from) {
      periodCondition.period = { [Op.gte]: from };
    } else if (to) {
      periodCondition.period = { [Op.lte]: to };
    }

    const [ingresos, gastos, incidentes, disponibilidad] = await Promise.all([
      DataRecord.sum('value', { where: { category_id: 1, ...periodCondition } }),
      DataRecord.sum('value', { where: { category_id: 2, ...periodCondition } }),
      DataRecord.sum('value', { where: { category_id: 3, ...periodCondition } }),
      DataRecord.findOne({
        where: { category_id: 4, ...periodCondition },
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
    const { category_id, from, to } = req.query;
    const where = category_id ? { category_id: parseInt(category_id) } : {};
    if (from && to) {
      where.period = { [Op.between]: [from, to] };
    } else if (from) {
      where.period = { [Op.gte]: from };
    } else if (to) {
      where.period = { [Op.lte]: to };
    }

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

// GET /api/analytics/my-records — tabla de datos del operador actual
const getMyRecords = async (req, res) => {
  try {
    const records = await DataRecord.findAll({
      where: { created_by: req.user.id },
      include: [{ model: DataCategory, as: 'category', attributes: ['name'] }],
      order: [['created_at', 'DESC']],
      limit: 100,
    });
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/records — tabla de datos
const getRecords = async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = {};
    if (from && to) {
      where.period = { [Op.between]: [from, to] };
    } else if (from) {
      where.period = { [Op.gte]: from };
    } else if (to) {
      where.period = { [Op.lte]: to };
    }

    const records = await DataRecord.findAll({
      where,
      include: [{ model: DataCategory, as: 'category', attributes: ['name'] }],
      order: [['created_at', 'DESC']],
      limit: 100,
    });
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const dangerousCharsCode = new Set([
  '='.charCodeAt(0), '+'.charCodeAt(0), '-'.charCodeAt(0),
  '@'.charCodeAt(0), '\t'.charCodeAt(0), '\r'.charCodeAt(0)
]);
const sanitize = (str) => {
  if (!str) return str;
  const stringified = String(str);
  if (dangerousCharsCode.has(stringified.charCodeAt(0))) {
    return "'" + stringified;
  }
  return stringified;
};

// GET /api/analytics/export-csv
const exportCSV = async (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sentinel_data.csv');

    res.write('id,title,category_name,value,unit,period,region,created_by_email,created_at\n');

    let offset = 0;
    const limit = 5000;
    let hasMore = true;

    while (hasMore) {
      const records = await DataRecord.findAll({
        include: [
          { model: DataCategory, as: 'category', attributes: ['name'] },
          { model: User, as: 'creator', attributes: ['email'] }
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset
      });

      if (records.length === 0) {
        hasMore = false;
        break;
      }

      const lines = new Array(records.length);
      for (let i = 0; i < records.length; i++) {
        const r = records[i];
        const title = `"${sanitize(r.title).replace(/"/g, '""')}"`;
        const category_name = `"${sanitize(r.category.name).replace(/"/g, '""')}"`;
        const value = r.value;
        const unit = r.unit ? `"${sanitize(r.unit).replace(/"/g, '""')}"` : '';
        const period = `"${sanitize(r.period).replace(/"/g, '""')}"`;
        const region = r.region ? `"${sanitize(r.region).replace(/"/g, '""')}"` : '';
        const email = r.creator && r.creator.email ? `"${sanitize(r.creator.email).replace(/"/g, '""')}"` : '';
        const created_at = r.created_at ? `"${new Date(r.created_at).toISOString()}"` : '';

        lines[i] = `${r.id},${title},${category_name},${value},${unit},${period},${region},${email},${created_at}`;
      }

      res.write(lines.join('\n') + '\n');
      offset += limit;

      if (records.length < limit) {
        hasMore = false;
      }
    }

    res.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.end();
    }
  }
};

module.exports = { getSummary, getChartData, getCategories, createRecord, getRecords, getMyRecords, exportCSV };
