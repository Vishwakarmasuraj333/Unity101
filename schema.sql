-- ============================================================================
-- UNITY 101 COMMUNITY RADIO — PRODUCTION DATABASE SCHEMA
-- Compatible with Aiven MySQL / AWS RDS / DigitalOcean Managed MySQL
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `defaultdb` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `defaultdb`;

-- ----------------------------------------------------------------------------
-- 1. TABLE: registrations
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `registrations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `town` VARCHAR(100) NOT NULL,
  `post_code` VARCHAR(20) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `mobile` VARCHAR(50) NOT NULL,
  `food_preference` ENUM('Veg Food', 'Non Veg Food') NOT NULL DEFAULT 'Veg Food',
  `gdpr_consent` TINYINT(1) NOT NULL DEFAULT 1,
  `status` ENUM('new', 'confirmed', 'cancelled') NOT NULL DEFAULT 'new',
  `notes` TEXT NULL,
  `created_by_admin` TINYINT(1) NOT NULL DEFAULT 0,
  `deleted_at` DATETIME NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX `idx_registrations_email` (`email`),
  INDEX `idx_registrations_mobile` (`mobile`),
  INDEX `idx_registrations_status` (`status`),
  INDEX `idx_registrations_food` (`food_preference`),
  INDEX `idx_registrations_created_at` (`created_at`),
  INDEX `idx_registrations_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. TABLE: admins
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL DEFAULT 'Unity 101 Admin',
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'superadmin',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX `idx_admins_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. TABLE: audit_logs
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `admin_id` INT UNSIGNED NULL,
  `admin_email` VARCHAR(191) NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` INT UNSIGNED NULL,
  `description` TEXT NOT NULL,
  `ip_address` VARCHAR(50) NULL,
  `user_agent` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX `idx_audit_admin_id` (`admin_id`),
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. TABLE: system_settings
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `system_settings` (
  `setting_key` VARCHAR(100) PRIMARY KEY,
  `setting_value` TEXT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. TABLE: email_logs
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `email_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `email_type` VARCHAR(50) NOT NULL,
  `recipient` VARCHAR(191) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `status` ENUM('sent', 'failed', 'simulated') NOT NULL DEFAULT 'sent',
  `message_id` VARCHAR(255) NULL,
  `error_message` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX `idx_email_recipient` (`recipient`),
  INDEX `idx_email_status` (`status`),
  INDEX `idx_email_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- INITIAL SEED: System Settings Defaults
-- ----------------------------------------------------------------------------
INSERT INTO `system_settings` (`setting_key`, `setting_value`) VALUES
  ('event_name', 'Unity 101 Community Radio - 20th Anniversary Gala Celebration'),
  ('event_date', '2026-11-20'),
  ('event_location', 'Southampton, Hampshire, UK'),
  ('registration_open', 'true'),
  ('allow_food_choice', 'true'),
  ('max_capacity', '500'),
  ('notification_email', 'events@unity101.org'),
  ('email_notifications_enabled', 'true'),
  ('smtp_host', 'smtp.gmail.com'),
  ('smtp_port', '587'),
  ('smtp_secure', 'false')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- ----------------------------------------------------------------------------
-- INITIAL SEED: Super Administrator Account
-- Default password: Admin@Unity101!2026
-- ----------------------------------------------------------------------------
INSERT INTO `admins` (`id`, `name`, `email`, `password_hash`, `role`) VALUES
  (1, 'Unity 101 Admin', 'admin@unity101events.org', '$2b$10$wO0oXmZeqmS0yV0c0iBqjeWcK5Dgn9o2xYmK1z07fS5k038927/6S', 'superadmin')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);
