-- ================================================
-- RENTAL MANAGER DATABASE SCHEMA v1.0
-- Run in phpMyAdmin: http://localhost/phpmyadmin
-- ================================================

CREATE DATABASE IF NOT EXISTS rent_redirect_ug
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rent_redirect_ug;

-- ── USERS ──────────────────────────────────────
CREATE TABLE users (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  full_name      VARCHAR(150) NOT NULL,
  phone          VARCHAR(20),
  role           ENUM('admin', 'landlord') DEFAULT 'landlord',
  is_active      BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login     DATETIME,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── PROPERTIES ─────────────────────────────────
CREATE TABLE properties (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  owner_id    INT NOT NULL,
  name        VARCHAR(200) NOT NULL,
  address     TEXT NOT NULL,
  parish      VARCHAR(100),
  district    VARCHAR(100) DEFAULT 'Kampala',
  description TEXT,
  photo_path  VARCHAR(500),
  total_units INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ── UNITS ──────────────────────────────────────
CREATE TABLE units (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  property_id  INT NOT NULL,
  unit_number  VARCHAR(50) NOT NULL,
  floor_number INT DEFAULT 0,
  unit_type    ENUM(
    'bedsitter',
    'one_bedroom',
    'two_bedroom',
    'three_bedroom',
    'studio',
    'shop',
    'office',
    'other'
  ) DEFAULT 'one_bedroom',
  rent_amount  DECIMAL(12, 2) NOT NULL,
  status       ENUM('vacant', 'occupied', 'maintenance') DEFAULT 'vacant',
  amenities    JSON,
  description  TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties (id) ON DELETE CASCADE,
  UNIQUE KEY uq_unit_in_property (property_id, unit_number)
);

-- ── TENANTS ─────────────────────────────────────
CREATE TABLE tenants (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  unit_id            INT NOT NULL,
  owner_id          INT NOT NULL,
  full_name         VARCHAR(200) NOT NULL,
  phone             VARCHAR(20) NOT NULL,
  email             VARCHAR(255),
  national_id       VARCHAR(50),
  emergency_name    VARCHAR(200),
  emergency_phone   VARCHAR(20),
  lease_start       DATE NOT NULL,
  lease_end         DATE,
  rent_override     DECIMAL(12, 2),
  deposit_amount    DECIMAL(12, 2) DEFAULT 0,
  deposit_paid      BOOLEAN DEFAULT FALSE,
  deposit_paid_date DATE,
  move_out_date     DATE,
  is_active         BOOLEAN DEFAULT TRUE,
  notes             TEXT,
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units (id),
  FOREIGN KEY (owner_id) REFERENCES users (id)
);

-- ── PAYMENTS ────────────────────────────────────
CREATE TABLE payments (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id      INT NOT NULL,
  unit_id        INT NOT NULL,
  amount         DECIMAL(12, 2) NOT NULL,
  payment_date   DATE NOT NULL,
  period_month   TINYINT NOT NULL COMMENT '1=Jan, 12=Dec',
  period_year    SMALLINT NOT NULL,
  payment_method ENUM(
    'momo_mtn',
    'momo_airtel',
    'cash',
    'bank_transfer',
    'cheque',
    'other'
  ) DEFAULT 'cash',
  reference_code VARCHAR(100) COMMENT 'MoMo transaction ID',
  receipt_number VARCHAR(50),
  notes          TEXT,
  recorded_by    INT NOT NULL,
  is_deleted     BOOLEAN DEFAULT FALSE,
  deleted_at     DATETIME,
  deleted_by     INT,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (unit_id) REFERENCES units (id),
  FOREIGN KEY (recorded_by) REFERENCES users (id),
  INDEX idx_period (period_year, period_month),
  INDEX idx_tenant_period (tenant_id, period_year, period_month)
);

-- ── MAINTENANCE REQUESTS ─────────────────────────
CREATE TABLE maintenance_requests (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  unit_id         INT NOT NULL,
  reported_by     INT COMMENT 'user_id or NULL if tenant reported',
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  priority        ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status          ENUM('open', 'in_progress', 'resolved') DEFAULT 'open',
  cost_incurred   DECIMAL(12, 2) DEFAULT 0,
  resolution_note TEXT,
  photo_path      VARCHAR(500),
  resolved_at     DATETIME,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units (id),
  FOREIGN KEY (reported_by) REFERENCES users (id)
);

-- ── NOTIFICATIONS ───────────────────────────────
CREATE TABLE notifications (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  type         ENUM(
    'payment_received',
    'lease_expiry',
    'arrears_alert',
    'maintenance_update',
    'system'
  ) NOT NULL,
  title        VARCHAR(200) NOT NULL,
  message      TEXT NOT NULL,
  is_read      BOOLEAN DEFAULT FALSE,
  related_id   INT COMMENT 'e.g. tenant_id or payment_id',
  related_type VARCHAR(50) COMMENT 'e.g. tenant or payment',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ── AUDIT LOG ───────────────────────────────────
CREATE TABLE audit_logs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT,
  action     VARCHAR(100) NOT NULL,
  table_name VARCHAR(50),
  record_id  INT,
  old_value  JSON,
  new_value  JSON,
  ip_address VARCHAR(45),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
