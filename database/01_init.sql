CREATE DATABASE IF NOT EXISTS sentinel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sentinel_db;

-- Tabla de roles
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Tabla de logs de auditoría
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  user_email VARCHAR(150),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status ENUM('success', 'failed', 'warning') DEFAULT 'success',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabla de sesiones activas (blacklist de tokens)
CREATE TABLE token_blacklist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  user_id INT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar roles (4 roles para RBAC)
INSERT INTO roles (name, description) VALUES
  ('admin',    'Acceso total al sistema. Gestión de usuarios, logs, políticas y configuración.'),
  ('analyst',  'Acceso a dashboards analíticos, reportes y exportación de datos.'),
  ('auditor',  'Acceso de solo lectura a logs de auditoría, riesgos y políticas.'),
  ('operator', 'Ingreso de datos operativos. Acceso limitado, sin reportes ni configuración.');

-- Insertar usuarios de prueba (password: Admin1234! para todos)
INSERT INTO users (name, email, password_hash, role_id) VALUES
  ('José Andrés Ureta',  'admin@sentinel.local',    '$2a$12$f0KRbVPS57q0C6zhyywfp.vd4PmcAnwqyeH5eSgci6iDCGbR/CbnS', 1),
  ('Ana Torres',         'analyst@sentinel.local',  '$2a$12$f0KRbVPS57q0C6zhyywfp.vd4PmcAnwqyeH5eSgci6iDCGbR/CbnS', 2),
  ('Pedro Vera',         'auditor@sentinel.local',  '$2a$12$f0KRbVPS57q0C6zhyywfp.vd4PmcAnwqyeH5eSgci6iDCGbR/CbnS', 3),
  ('Luis Mora',          'operator@sentinel.local', '$2a$12$f0KRbVPS57q0C6zhyywfp.vd4PmcAnwqyeH5eSgci6iDCGbR/CbnS', 4);
