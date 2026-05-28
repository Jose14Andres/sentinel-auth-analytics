CREATE TABLE IF NOT EXISTS risks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  probability ENUM('baja','media','alta','muy_alta') NOT NULL,
  impact ENUM('bajo','medio','alto','critico') NOT NULL,
  level ENUM('bajo','medio','alto','critico') GENERATED ALWAYS AS (
    CASE
      WHEN probability IN ('alta','muy_alta') AND impact IN ('alto','critico') THEN 'critico'
      WHEN probability IN ('alta','muy_alta') OR impact IN ('alto','critico') THEN 'alto'
      WHEN probability = 'media' OR impact = 'medio' THEN 'medio'
      ELSE 'bajo'
    END
  ) STORED,
  mitigation TEXT,
  responsible VARCHAR(100),
  status ENUM('activo','mitigado','aceptado') DEFAULT 'activo',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Seed 10 sample risks
INSERT INTO risks (title,description,category,probability,impact,mitigation,responsible,created_by) VALUES
('Acceso no autorizado al sistema','Credenciales comprometidas permiten acceso indebido','Seguridad',  'alta',   'critico','JWT + bcrypt factor-12 + RBAC implementados','Admin TI',1),
('Inyección SQL','Consultas maliciosas en campos de entrada','Seguridad',    'media',  'critico','Sequelize ORM parametriza todas las consultas','Dev Backend',1),
('Pérdida de datos operativos','Fallo en volumen MySQL sin backup','Disponibilidad','media','alto',   'Backup automático semanal del volumen mysql_data','Admin TI',1),
('Credenciales débiles de usuarios','Contraseñas sin complejidad mínima','Seguridad','alta','alto',   'Política de contraseñas + bcrypt implementado','Admin TI',1),
('Indisponibilidad del contenedor backend','Fallo en sentinel_backend sin recuperación','Disponibilidad','baja','alto','restart: unless-stopped en Docker Compose','DevOps',1),
('Exposición de datos sensibles en logs','Contraseñas o tokens en archivos de log','Seguridad','baja','medio','auditMiddleware sanitiza campo password con [REDACTED]','Dev Backend',1),
('Falta de trazabilidad de acciones','Sin audit_logs no se detectan incidentes','Cumplimiento','baja','medio','Módulo auditMiddleware implementado y activo','Admin TI',1),
('Tiempo de respuesta alto en analítica','Consultas SQL sin índices en tablas grandes','Rendimiento','media','medio','Índices en period y category_id de data_records','DBA',1),
('Incumplimiento ISO 38500','Sin políticas TI documentadas formalmente','Gobernanza','media','alto','Módulo de políticas y checklist en desarrollo','Gobierno TI',1),
('Token JWT sin rotación','Token comprometido válido hasta expiración 8h','Seguridad','baja','medio','Token blacklist en tabla token_blacklist implementada','Dev Backend',1);
