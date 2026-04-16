-- ============================================================
-- MIGRATION 004: Sync stock data with Excel file
-- Date: 2026-04-16
-- ============================================================

-- 1. Add purchased_qty and total_qty columns to stock_items (for Kitchen Stock)
ALTER TABLE stock_items
  ADD COLUMN IF NOT EXISTS purchased_qty DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_qty DECIMAL(10,2) DEFAULT 0;

-- 2. Add month_label to purchase_history for grouping
ALTER TABLE purchase_history
  ADD COLUMN IF NOT EXISTS month_label VARCHAR(20);

-- 3. Add missing Kitchen Essentials items
INSERT INTO stock_items (category, item_name, current_quantity, unit, is_durable)
VALUES
  ('Kitchen Essentials', 'Morning Fresh', 4, 'pcs', FALSE),
  ('Kitchen Essentials', 'Bar Soap', 1, 'pcs', FALSE)
ON CONFLICT (category, item_name) DO NOTHING;

-- 4. Add missing Kitchen Stock item
INSERT INTO stock_items (category, item_name, current_quantity, unit, is_durable, notes)
VALUES ('Kitchen Stock', 'Long Brushes', 2, 'pcs', TRUE, '')
ON CONFLICT (category, item_name) DO NOTHING;

-- 5. Update Kitchen Stock purchased_qty and total_qty from Excel
UPDATE stock_items SET purchased_qty = 12, total_qty = 18 WHERE category = 'Kitchen Stock' AND item_name = 'Plates';
UPDATE stock_items SET purchased_qty = 6,  total_qty = 14 WHERE category = 'Kitchen Stock' AND item_name = 'Side Plates';
UPDATE stock_items SET purchased_qty = 6,  total_qty = 19 WHERE category = 'Kitchen Stock' AND item_name = 'Spoons';
UPDATE stock_items SET purchased_qty = 6,  total_qty = 10 WHERE category = 'Kitchen Stock' AND item_name = 'Tea Spoons';
UPDATE stock_items SET purchased_qty = 12, total_qty = 17 WHERE category = 'Kitchen Stock' AND item_name = 'Forks';
UPDATE stock_items SET purchased_qty = 6,  total_qty = 28 WHERE category = 'Kitchen Stock' AND item_name = 'Glasses';
UPDATE stock_items SET purchased_qty = 12, total_qty = 30 WHERE category = 'Kitchen Stock' AND item_name = 'Cups';
UPDATE stock_items SET purchased_qty = 1,  total_qty = 11 WHERE category = 'Kitchen Stock' AND item_name = 'Thermos';
UPDATE stock_items SET purchased_qty = 2,  total_qty = 7  WHERE category = 'Kitchen Stock' AND item_name = 'Glass Jugs';

-- 6. Clear old sample water deliveries and insert all real data from Excel
DELETE FROM water_deliveries;

INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES
  ('2025-09-17', 7,  ''),
  ('2025-09-23', 7,  'Month total: 14'),
  ('2025-10-07', 7,  ''),
  ('2025-10-10', 9,  ''),
  ('2025-10-14', 4,  ''),
  ('2025-10-23', 7,  ''),
  ('2025-10-29', 6,  'Month total: 33'),
  ('2025-11-04', 8,  ''),
  ('2025-11-11', 8,  ''),
  ('2025-11-19', 7,  ''),
  ('2025-11-26', 5,  'Month total: 28'),
  ('2025-12-02', 8,  ''),
  ('2025-12-10', 4,  ''),
  ('2025-12-16', 7,  'Month total: 19'),
  ('2026-01-06', 7,  ''),
  ('2026-01-13', 9,  ''),
  ('2026-01-21', 9,  ''),
  ('2026-01-26', 6,  'Month total: 31'),
  ('2026-02-02', 7,  ''),
  ('2026-02-09', 2,  ''),
  ('2026-02-17', 11, ''),
  ('2026-02-24', 8,  'Month total: 37'),
  ('2026-03-04', 9,  ''),
  ('2026-03-10', 7,  ''),
  ('2026-03-17', 8,  ''),
  ('2026-03-25', 8,  'Month total: 32'),
  ('2026-04-01', 9,  ''),
  ('2026-04-08', 6,  '');
