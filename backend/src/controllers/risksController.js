const Risk = require('../models/Risk');
const User = require('../models/User');

const getAll = async (req, res) => {
  try {
    const risks = await Risk.findAll({
      include: [{ model: User, as: 'creator', attributes: ['name', 'email'] }],
      order: [
        ['level', 'DESC'], // Note: enum order in DB depends on enum definition, MySQL orders ENUM by their index.
        // Let's actually sort by raw sql or leave it if MySQL handles it. 'bajo','medio','alto','critico' are ordered 1, 2, 3, 4, so DESC works perfectly.
        ['created_at', 'DESC']
      ]
    });
    res.json({ success: true, data: risks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const risk = await Risk.findByPk(req.params.id, {
      include: [{ model: User, as: 'creator', attributes: ['name', 'email'] }]
    });
    if (!risk) return res.status(404).json({ success: false, message: 'Riesgo no encontrado' });
    res.json({ success: true, data: risk });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const create = async (req, res) => {
  try {
    // Extracting level is not needed as it's generated, but user might send it. We'll ignore it.
    const { title, description, category, probability, impact, mitigation, responsible, status } = req.body;
    const risk = await Risk.create({
      title, description, category, probability, impact, mitigation, responsible, status,
      created_by: req.user.id
    });
    // Re-fetch to get the generated level
    const newRisk = await Risk.findByPk(risk.id);
    res.status(201).json({ success: true, data: newRisk });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const risk = await Risk.findByPk(req.params.id);
    if (!risk) return res.status(404).json({ success: false, message: 'Riesgo no encontrado' });

    const { title, description, category, probability, impact, mitigation, responsible, status } = req.body;
    await risk.update({ title, description, category, probability, impact, mitigation, responsible, status });

    // Re-fetch to get updated generated level
    const updatedRisk = await Risk.findByPk(risk.id);
    res.json({ success: true, data: updatedRisk });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const risk = await Risk.findByPk(req.params.id);
    if (!risk) return res.status(404).json({ success: false, message: 'Riesgo no encontrado' });

    await risk.destroy();
    res.json({ success: true, message: 'Riesgo eliminado' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getSummary = async (req, res) => {
  try {
    const risks = await Risk.findAll({ attributes: ['level'] });
    const summary = { bajo: 0, medio: 0, alto: 0, critico: 0, total: risks.length };

    risks.forEach(r => {
      if (summary[r.level] !== undefined) {
        summary[r.level]++;
      }
    });

    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove, getSummary };
