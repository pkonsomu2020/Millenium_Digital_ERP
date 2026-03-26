-- ============================================
-- MIGRATION: Remove Threshold Column
-- Date: 2026-03-13
-- Description: Remove threshold column from stock_items table
--              as it's no longer needed for stock management
-- ============================================

-- Remove the threshold column from stock_items table
ALTER TABLE stock_items DROP COLUMN IF EXISTS threshold;

-- Update the getLowStockItems function/view if it exists
-- (This endpoint may no longer be needed, but we'll keep the table structure clean)

-- Note: The getLowStockItems API endpoint in the backend should be 
-- removed or updated as it relies on the threshold column

