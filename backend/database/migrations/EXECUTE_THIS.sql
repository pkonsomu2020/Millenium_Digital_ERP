-- ============================================
-- MIGRATION: Remove Threshold Column
-- ============================================
-- Copy this entire file and paste it into Supabase SQL Editor
-- Then click "Run" or press Ctrl+Enter
-- ============================================

-- Remove the threshold column from stock_items table
ALTER TABLE stock_items DROP COLUMN IF EXISTS threshold;

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'stock_items' 
ORDER BY ordinal_position;

-- ============================================
-- Expected Result:
-- You should see a list of columns WITHOUT 'threshold'
-- ============================================
