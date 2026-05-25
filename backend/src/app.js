require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const sequelize = require('./config/database');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', require('./routes/authRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'sentinel-backend' }));

const PORT = process.env.PORT || 3001;
sequelize.authenticate()
  .then(() => {
    console.log('✅ MySQL conectado');
    app.listen(PORT, () => console.log(`🚀 Backend corriendo en http://localhost:${PORT}`));
  })
  .catch(err => { console.error('❌ Error DB:', err); process.exit(1); });

module.exports = app;
