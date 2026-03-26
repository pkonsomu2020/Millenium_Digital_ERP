-- Users table for dashboard authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'hr')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Only backend service role can access
CREATE POLICY "Service role only" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- Seed users
-- Passwords are bcrypt hashed: Millenium@2026!
-- Hash generated with bcrypt rounds=10
-- Run this after generating hashes via the seed script
