-- Unity 101 Community Radio Event Registration Schema
CREATE DATABASE IF NOT EXISTS unity101_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE unity101_db;

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  town VARCHAR(100) NOT NULL,
  post_code VARCHAR(20) NOT NULL,
  email VARCHAR(150) NOT NULL,
  mobile VARCHAR(30) NOT NULL,
  food_preference ENUM('Veg Food', 'Non Veg Food') NOT NULL,
  gdpr_consent TINYINT(1) NOT NULL DEFAULT 1,
  status ENUM('new', 'confirmed', 'cancelled') NOT NULL DEFAULT 'new',
  notes TEXT NULL,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reg_email (email),
  INDEX idx_reg_mobile (mobile),
  INDEX idx_reg_status (status),
  INDEX idx_reg_deleted (deleted_at),
  INDEX idx_reg_created (created_at),
  INDEX idx_reg_town (town),
  INDEX idx_reg_food (food_preference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Admin Activity Logs Table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NULL,
  admin_email VARCHAR(150) NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_logs_action (action),
  INDEX idx_logs_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default Admin User (admin@unity101events.org / Admin@Unity101!2026)
INSERT INTO admins (name, email, password_hash, role)
VALUES ('Unity 101 Admin', 'admin@unity101events.org', '$2b$10$bSefRLkqwh7jA93VafgKxOX0OT183Be6SA59XmD4A2KXIQVqu9QgW', 'superadmin')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Default Settings
INSERT INTO system_settings (setting_key, setting_value)
VALUES 
  ('event_name', 'Unity 101 Community Radio - 20th Anniversary Gala & Celebration'),
  ('event_date', '2026-11-20'),
  ('event_location', 'Southampton, Hampshire, UK'),
  ('registration_open', 'true'),
  ('allow_food_choice', 'true'),
  ('notification_email', 'events@unity101.org')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);
