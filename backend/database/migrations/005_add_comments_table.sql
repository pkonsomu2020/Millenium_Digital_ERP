-- ============================================================
-- MIGRATION 005: Add comments table for purchase date rows
-- Date: 2026-04-16
-- ============================================================

-- Create table to store comments for each purchase date
CREATE TABLE IF NOT EXISTS purchase_date_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL,
  purchase_date DATE NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category, purchase_date)
);

-- Enable RLS
ALTER TABLE purchase_date_comments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write
CREATE POLICY "Allow authenticated read access" ON purchase_date_comments
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow authenticated write access" ON purchase_date_comments
  FOR ALL USING (auth.role() = 'authenticated');

-- Index for performance
CREATE INDEX idx_purchase_date_comments_category_date ON purchase_date_comments(category, purchase_date);
