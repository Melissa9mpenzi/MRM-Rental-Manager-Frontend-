-- Database Constraints Migration
-- IMPORTANT: Run backend/init_db.py FIRST to create tables, THEN run this SQL
-- This adds indexes, unique constraints, and foreign keys to existing tables

-- 1. Unique email constraint on users table
ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email);

-- 2. Ensure only one active lease per unit
-- This is enforced via application logic + partial unique index (if DB supports it)
-- For PostgreSQL:
-- CREATE UNIQUE INDEX uq_active_lease_per_unit ON leases (unit_id) WHERE status = 'active';
-- For MySQL/SQLite: Enforced in application code

-- 3. Foreign key constraints with strict referential integrity
-- These assume your tables already exist

-- Leases foreign keys
ALTER TABLE leases ADD CONSTRAINT fk_leases_tenant_id 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;
    
ALTER TABLE leases ADD CONSTRAINT fk_leases_unit_id 
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT;

-- Invoices foreign keys  
ALTER TABLE invoices ADD CONSTRAINT fk_invoices_lease_id 
    FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE RESTRICT;
    
ALTER TABLE invoices ADD CONSTRAINT fk_invoices_tenant_id 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- Payments foreign keys
ALTER TABLE payments ADD CONSTRAINT fk_payments_lease_id 
    FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE RESTRICT;
    
ALTER TABLE payments ADD CONSTRAINT fk_payments_tenant_id 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- Maintenance requests foreign key
ALTER TABLE maintenance_requests ADD CONSTRAINT fk_maintenance_unit_id 
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE;

-- Notifications foreign key
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Audit logs foreign key
ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 4. Check constraints for valid status values
-- Note: MySQL 8.0.16+ and PostgreSQL support CHECK constraints
-- SQLite supports CHECK constraints

-- Lease status check
ALTER TABLE leases ADD CONSTRAINT chk_lease_status 
    CHECK (status IN ('active', 'terminated', 'expired'));

-- Invoice status check  
ALTER TABLE invoices ADD CONSTRAINT chk_invoice_status 
    CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'));

-- Unit status check
ALTER TABLE units ADD CONSTRAINT chk_unit_status 
    CHECK (status IN ('vacant', 'occupied', 'maintenance'));

-- User role check
ALTER TABLE users ADD CONSTRAINT chk_user_role 
    CHECK (role IN ('admin', 'staff', 'tenant'));

-- 5. OTP expiry must be in the future (application-level validation recommended)
-- This is handled in application code

-- 6. Indexes for performance
CREATE INDEX idx_leases_tenant_id ON leases(tenant_id);
CREATE INDEX idx_leases_unit_id ON leases(unit_id);
CREATE INDEX idx_leases_status ON leases(status);
CREATE INDEX idx_invoices_lease_id ON invoices(lease_id);
CREATE INDEX idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_payments_lease_id ON payments(lease_id);
CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX idx_tenants_user_id ON tenants(user_id);
CREATE INDEX idx_units_property_id ON units(property_id);
