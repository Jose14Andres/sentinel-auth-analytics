-- Categorías de datos
CREATE TABLE IF NOT EXISTS data_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registros de datos operativos (los ingresa el Operador)
CREATE TABLE IF NOT EXISTS data_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  value DECIMAL(15,2) NOT NULL,
  unit VARCHAR(50),
  period VARCHAR(20) NOT NULL COMMENT 'YYYY-MM',
  region VARCHAR(100),
  notes TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES data_categories(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Seed de categorías
INSERT IGNORE INTO data_categories (name, description) VALUES
  ('Ingresos',      'Ingresos operativos mensuales'),
  ('Gastos',        'Gastos operativos mensuales'),
  ('Incidentes TI', 'Número de incidentes de seguridad TI'),
  ('Disponibilidad','Porcentaje de disponibilidad de sistemas'),
  ('Usuarios activos', 'Cantidad de usuarios activos en el sistema');

-- Seed de datos de ejemplo (últimos 6 meses)
INSERT IGNORE INTO data_records (category_id, title, value, unit, period, region, created_by) VALUES
  (1,'Ingresos Enero',   45200, 'USD', '2026-01', 'Quito',     1),
  (1,'Ingresos Febrero', 48900, 'USD', '2026-02', 'Quito',     1),
  (1,'Ingresos Marzo',   52100, 'USD', '2026-03', 'Guayaquil', 1),
  (1,'Ingresos Abril',   49800, 'USD', '2026-04', 'Quito',     1),
  (1,'Ingresos Mayo',    55300, 'USD', '2026-05', 'Quito',     1),
  (2,'Gastos Enero',     31000, 'USD', '2026-01', 'Quito',     1),
  (2,'Gastos Febrero',   33500, 'USD', '2026-02', 'Quito',     1),
  (2,'Gastos Marzo',     30200, 'USD', '2026-03', 'Guayaquil', 1),
  (2,'Gastos Abril',     35100, 'USD', '2026-04', 'Quito',     1),
  (2,'Gastos Mayo',      32800, 'USD', '2026-05', 'Quito',     1),
  (3,'Incidentes Enero',    5, 'incidentes', '2026-01', 'Nacional', 1),
  (3,'Incidentes Febrero',  3, 'incidentes', '2026-02', 'Nacional', 1),
  (3,'Incidentes Marzo',    7, 'incidentes', '2026-03', 'Nacional', 1),
  (3,'Incidentes Abril',    2, 'incidentes', '2026-04', 'Nacional', 1),
  (3,'Incidentes Mayo',     4, 'incidentes', '2026-05', 'Nacional', 1),
  (4,'Disponibilidad Enero',   99.2, '%', '2026-01', 'Nacional', 1),
  (4,'Disponibilidad Febrero', 98.8, '%', '2026-02', 'Nacional', 1),
  (4,'Disponibilidad Marzo',   97.5, '%', '2026-03', 'Nacional', 1),
  (4,'Disponibilidad Abril',   99.5, '%', '2026-04', 'Nacional', 1),
  (4,'Disponibilidad Mayo',    99.1, '%', '2026-05', 'Nacional', 1);
