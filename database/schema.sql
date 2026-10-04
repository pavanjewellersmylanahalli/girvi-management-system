-- Girvi Management System - Database Schema
-- Supabase PostgreSQL Database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SHOPS TABLE - Main tenant/shop registration
-- =====================================================
CREATE TABLE shops (
    shop_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_name VARCHAR(255) NOT NULL,
    shop_owner_name VARCHAR(255) NOT NULL,
    shop_number VARCHAR(20) NOT NULL,
    shop_address TEXT NOT NULL,
    shop_gstin VARCHAR(15), -- Optional, 15 characters as per Indian GSTIN format
    shop_userid VARCHAR(50) UNIQUE NOT NULL, -- Unique login ID
    shop_passcode_hash VARCHAR(255) NOT NULL, -- Hashed 4-6 digit passcode
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT shop_userid_format CHECK (LENGTH(shop_userid) >= 3),
    CONSTRAINT shop_gstin_format CHECK (shop_gstin IS NULL OR shop_gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'),
    CONSTRAINT shop_number_format CHECK (LENGTH(shop_number) >= 10)
);

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX idx_shops_userid ON shops(shop_userid);
CREATE INDEX idx_shops_active ON shops(is_active);
CREATE INDEX idx_shops_created_at ON shops(created_at);

-- =====================================================
-- SHOP_SESSIONS - Track active login sessions
-- =====================================================
CREATE TABLE shop_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_shop_session FOREIGN KEY (shop_id) REFERENCES shops(shop_id)
);

CREATE INDEX idx_sessions_shop_id ON shop_sessions(shop_id);
CREATE INDEX idx_sessions_token ON shop_sessions(session_token);
CREATE INDEX idx_sessions_expires ON shop_sessions(expires_at);

-- =====================================================
-- AUDIT_LOGS - Track all important actions per shop
-- =====================================================
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- e.g., 'LOGIN', 'CREATE_ENTRY', 'UPDATE_ENTRY'
    action_details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_shop_audit FOREIGN KEY (shop_id) REFERENCES shops(shop_id)
);

CREATE INDEX idx_audit_shop_id ON audit_logs(shop_id);
CREATE INDEX idx_audit_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on shops table
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything (for backend API)
CREATE POLICY shops_service_role_policy ON shops
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Authenticated users can read their own shop
CREATE POLICY shops_select_own ON shops
    FOR SELECT
    TO authenticated
    USING (shop_id = (current_setting('request.jwt.claims', true)::json->>'shop_id')::uuid);

-- Enable RLS on shop_sessions
ALTER TABLE shop_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage all sessions
CREATE POLICY sessions_service_role_policy ON shop_sessions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Authenticated users can read their own sessions
CREATE POLICY sessions_select_own ON shop_sessions
    FOR SELECT
    TO authenticated
    USING (shop_id = (current_setting('request.jwt.claims', true)::json->>'shop_id')::uuid);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage all logs
CREATE POLICY audit_service_role_policy ON audit_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Authenticated users can read their own audit logs
CREATE POLICY audit_select_own ON audit_logs
    FOR SELECT
    TO authenticated
    USING (shop_id = (current_setting('request.jwt.claims', true)::json->>'shop_id')::uuid);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on shops table
CREATE TRIGGER update_shops_updated_at 
    BEFORE UPDATE ON shops
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM shop_sessions WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS for documentation
-- =====================================================
COMMENT ON TABLE shops IS 'Main table storing shop/tenant information for multi-tenant architecture';
COMMENT ON COLUMN shops.shop_passcode_hash IS 'Bcrypt hashed 4-6 digit passcode for shop login';
COMMENT ON COLUMN shops.shop_gstin IS 'Optional GST Identification Number (15 chars) for tax compliance';
COMMENT ON TABLE shop_sessions IS 'Active login sessions with JWT tokens for authentication';
COMMENT ON TABLE audit_logs IS 'Audit trail for all shop actions for security and compliance';
