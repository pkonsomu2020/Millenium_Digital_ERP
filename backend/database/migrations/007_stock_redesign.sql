-- ============================================================
-- MIGRATION 007: Complete Stock Management Redesign
-- Date: 2026-05-31
-- Description: Drop old tables, create new dual-period schema,
--              seed all data from Excel file
-- ============================================================

-- Drop old tables
DROP TABLE IF EXISTS purchase_date_comments CASCADE;
DROP TABLE IF EXISTS purchase_history CASCADE;
DROP TABLE IF EXISTS stock_items CASCADE;
DROP TABLE IF EXISTS water_deliveries CASCADE;

-- ============================================================
-- stock_items: Item definitions across all categories
-- ============================================================
CREATE TABLE stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  is_durable BOOLEAN DEFAULT FALSE,
  notes TEXT,
  current_quantity DECIMAL(10,2) DEFAULT 0,
  purchased_qty DECIMAL(10,2) DEFAULT 0,
  broken_lost_qty DECIMAL(10,2) DEFAULT 0,
  total_qty DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, item_name)
);

-- ============================================================
-- stock_months: Month definitions per category
-- ============================================================
CREATE TABLE stock_months (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  month_key VARCHAR(7) NOT NULL,
  month_label VARCHAR(30) NOT NULL,
  period_1_label TEXT,
  period_2_label TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, month_key)
);

-- ============================================================
-- stock_entries: Dual-period data per item per month
-- ============================================================
CREATE TABLE stock_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_item_id UUID REFERENCES stock_items(id) ON DELETE CASCADE,
  month_id UUID REFERENCES stock_months(id) ON DELETE CASCADE,
  p1_opening DECIMAL(10,2) DEFAULT 0,
  p1_bought DECIMAL(10,2) DEFAULT 0,
  p1_used DECIMAL(10,2) DEFAULT 0,
  p1_closing DECIMAL(10,2) DEFAULT 0,
  p2_opening DECIMAL(10,2) DEFAULT 0,
  p2_bought DECIMAL(10,2) DEFAULT 0,
  p2_used DECIMAL(10,2) DEFAULT 0,
  p2_closing DECIMAL(10,2) DEFAULT 0,
  total_bought DECIMAL(10,2) DEFAULT 0,
  total_used DECIMAL(10,2) DEFAULT 0,
  stock_movement DECIMAL(10,2) DEFAULT 0,
  final_closing DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stock_item_id, month_id)
);

-- ============================================================
-- water_deliveries: Water bottle delivery log
-- ============================================================
CREATE TABLE water_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_date DATE NOT NULL,
  bottles_delivered INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- purchase_date_comments: Comments per category per date
-- ============================================================
CREATE TABLE purchase_date_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  purchase_date DATE NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, purchase_date)
);

CREATE INDEX idx_stock_items_category ON stock_items(category);
CREATE INDEX idx_stock_months_category_key ON stock_months(category, month_key);
CREATE INDEX idx_stock_entries_item ON stock_entries(stock_item_id);
CREATE INDEX idx_stock_entries_month ON stock_entries(month_id);
CREATE INDEX idx_water_deliveries_date ON water_deliveries(delivery_date DESC);
CREATE INDEX idx_purchase_date_comments_cat_date ON purchase_date_comments(category, purchase_date);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stock_items_updated_at BEFORE UPDATE ON stock_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_entries_updated_at BEFORE UPDATE ON stock_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_date_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on stock_items" ON stock_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on stock_months" ON stock_months FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on stock_entries" ON stock_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on water_deliveries" ON water_deliveries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on purchase_date_comments" ON purchase_date_comments FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SEED DATA
-- ============================================================
-- Seed stock_items
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Essentials', 'Sugar', 'kg', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Essentials', 'Milk', 'boxes', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Essentials', 'Drinking Chocolate', 'tin', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Essentials', 'Coffee', 'tin', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Essentials', 'Tea Leaves', 'bags', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Essentials', 'Matchbox', 'pkt', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Essentials', 'Morning Fresh', 'pcs', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Essentials', 'Bar Soap', 'pcs', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Essentials', 'Super Brite', 'pcs', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Essentials', 'Batteries', 'pairs', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Washroom Essentials', 'Tissue', 'pkts', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Washroom Essentials', 'Serviettes', 'pkts', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Washroom Essentials', 'Hand Towels', 'pkts', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Washroom Essentials', 'Toilet Balls', 'pkts', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Washroom Essentials', 'Liquid Washing Soap', 'L', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Washroom Essentials', 'Gloves', 'pairs', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Washroom Essentials', 'Mop', 'pcs', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Washroom Essentials', 'Hand Wash', 'pcs', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Washroom Essentials', 'Washroom Soap', 'pcs', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Washroom Essentials', 'Glass Cleaner', 'pcs', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Washroom Essentials', 'Jik White', 'bottle', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Washroom Essentials', 'Jik Coloured', 'bottle', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Washroom Essentials', 'Furniture Polish', 'bottle', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Washroom Essentials', 'Washing Powder', 'pkts', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Snacks', 'Biscuits', 'tins', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Snacks', 'Peanuts', 'pkts', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Snacks', 'Honey', 'tins', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Snacks', 'Hibiscus', 'pkts', FALSE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Plates', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Side Plates', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Spoons', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Tea Spoons', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Forks', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Glasses', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Cups', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Thermos', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Glass Jugs', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Plastic Jugs', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Serving Trays', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Tumblers', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Sufurias (Pots)', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Buckets', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Dustbins', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Sugar Dish', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Salt Shakers', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Kitchen Towels', 'pkts', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Pegs', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Cloth Line', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Scrubbing Brush', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Kitchen Stock', 'Long Brushes', 'pcs', TRUE) ON CONFLICT (category, item_name) DO NOTHING;
INSERT INTO stock_items (category, item_name, unit, is_durable) VALUES ('Water Count', 'Dispenser Bottles', 'bottles', FALSE) ON CONFLICT (category, item_name) DO NOTHING;

-- Seed Kitchen Stock durable data
UPDATE stock_items SET current_quantity=6, purchased_qty=12, broken_lost_qty=0, total_qty=18, notes='SIGNVRSE' WHERE category='Kitchen Stock' AND item_name='Plates';
UPDATE stock_items SET current_quantity=8, purchased_qty=6, broken_lost_qty=0, total_qty=14, notes='AFOSI' WHERE category='Kitchen Stock' AND item_name='Side Plates';
UPDATE stock_items SET current_quantity=13, purchased_qty=6, broken_lost_qty=0, total_qty=19, notes='AFOSI' WHERE category='Kitchen Stock' AND item_name='Spoons';
UPDATE stock_items SET current_quantity=4, purchased_qty=6, broken_lost_qty=0, total_qty=10, notes='MILLENIUM' WHERE category='Kitchen Stock' AND item_name='Tea Spoons';
UPDATE stock_items SET current_quantity=5, purchased_qty=12, broken_lost_qty=0, total_qty=17, notes='AFOSI' WHERE category='Kitchen Stock' AND item_name='Forks';
UPDATE stock_items SET current_quantity=22, purchased_qty=6, broken_lost_qty=3, total_qty=25, notes='MILLENIUM' WHERE category='Kitchen Stock' AND item_name='Glasses';
UPDATE stock_items SET current_quantity=18, purchased_qty=12, broken_lost_qty=4, total_qty=24, notes='MILLENIUM' WHERE category='Kitchen Stock' AND item_name='Cups';
UPDATE stock_items SET current_quantity=10, purchased_qty=1, broken_lost_qty=0, total_qty=11, notes='AFOSI' WHERE category='Kitchen Stock' AND item_name='Thermos';
UPDATE stock_items SET current_quantity=5, purchased_qty=2, broken_lost_qty=0, total_qty=7, notes='' WHERE category='Kitchen Stock' AND item_name='Glass Jugs';
UPDATE stock_items SET current_quantity=3, purchased_qty=0, broken_lost_qty=0, total_qty=3, notes='' WHERE category='Kitchen Stock' AND item_name='Plastic Jugs';
UPDATE stock_items SET current_quantity=6, purchased_qty=0, broken_lost_qty=0, total_qty=6, notes='' WHERE category='Kitchen Stock' AND item_name='Serving Trays';
UPDATE stock_items SET current_quantity=13, purchased_qty=0, broken_lost_qty=0, total_qty=13, notes='' WHERE category='Kitchen Stock' AND item_name='Tumblers';
UPDATE stock_items SET current_quantity=3, purchased_qty=0, broken_lost_qty=0, total_qty=3, notes='' WHERE category='Kitchen Stock' AND item_name='Sufurias (Pots)';
UPDATE stock_items SET current_quantity=5, purchased_qty=0, broken_lost_qty=0, total_qty=5, notes='' WHERE category='Kitchen Stock' AND item_name='Buckets';
UPDATE stock_items SET current_quantity=16, purchased_qty=0, broken_lost_qty=0, total_qty=16, notes='' WHERE category='Kitchen Stock' AND item_name='Dustbins';
UPDATE stock_items SET current_quantity=2, purchased_qty=2, broken_lost_qty=2, total_qty=2, notes='' WHERE category='Kitchen Stock' AND item_name='Sugar Dish';
UPDATE stock_items SET current_quantity=3, purchased_qty=3, broken_lost_qty=0, total_qty=6, notes='MILLENIUM' WHERE category='Kitchen Stock' AND item_name='Salt Shakers';
UPDATE stock_items SET current_quantity=6, purchased_qty=0, broken_lost_qty=0, total_qty=6, notes='' WHERE category='Kitchen Stock' AND item_name='Kitchen Towels';
UPDATE stock_items SET current_quantity=10, purchased_qty=0, broken_lost_qty=0, total_qty=10, notes='' WHERE category='Kitchen Stock' AND item_name='Pegs';
UPDATE stock_items SET current_quantity=1, purchased_qty=0, broken_lost_qty=0, total_qty=1, notes='' WHERE category='Kitchen Stock' AND item_name='Cloth Line';
UPDATE stock_items SET current_quantity=1, purchased_qty=0, broken_lost_qty=0, total_qty=1, notes='' WHERE category='Kitchen Stock' AND item_name='Scrubbing Brush';
UPDATE stock_items SET current_quantity=2, purchased_qty=1, broken_lost_qty=0, total_qty=3, notes='' WHERE category='Kitchen Stock' AND item_name='Long Brushes';

-- Seed Water Count current quantity
UPDATE stock_items SET current_quantity=7 WHERE category='Water Count' AND item_name='Dispenser Bottles';

-- Seed stock_months
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Kitchen Essentials', '2025-09', 'SEPTEMBER 2025', 'Period 1 (16/09/25)', 'Period 2 (30/09/25)', 202509) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Washroom Essentials', '2025-09', 'SEPTEMBER 2025', 'Period 1 (16/09/25)', 'Period 2 (30/09/25)', 202509) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Snacks', '2025-09', 'SEPTEMBER 2025', 'Period 1 (16/09/25)', 'Period 2 (30/09/25)', 202509) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Kitchen Essentials', '2025-10', 'OCTOBER 2025', 'Period 1 (22/10/25)', 'PERIOD 2', 202510) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Washroom Essentials', '2025-10', 'OCTOBER 2025', 'Period 1 (22/10/25)', 'PERIOD 2', 202510) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Snacks', '2025-10', 'OCTOBER 2025', 'Period 1 (22/10/25)', 'PERIOD 2', 202510) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Kitchen Essentials', '2025-11', 'NOVEMBER 2025', 'Period 1 (11/11/25)', 'Period 2 (27/11/25)', 202511) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Washroom Essentials', '2025-11', 'NOVEMBER 2025', 'Period 1 (11/11/25)', 'Period 2 (27/11/25)', 202511) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Snacks', '2025-11', 'NOVEMBER 2025', 'Period 1 (11/11/25)', 'Period 2 (27/11/25)', 202511) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Kitchen Essentials', '2025-12', 'DECEMBER 2025', 'Period 1 (15/12/25)', 'PERIOD 2', 202512) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Washroom Essentials', '2025-12', 'DECEMBER 2025', 'Period 1 (15/12/25)', 'PERIOD 2', 202512) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Snacks', '2025-12', 'DECEMBER 2025', 'Period 1 (15/12/25)', 'PERIOD 2', 202512) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Kitchen Essentials', '2026-01', 'JANUARY 2026', 'Period 1 (13/01/26)', 'Period 2 (27-28/01/26)', 202601) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Washroom Essentials', '2026-01', 'JANUARY 2026', 'Period 1 (13/01/26)', 'Period 2 (27-28/01/26)', 202601) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Snacks', '2026-01', 'JANUARY 2026', 'Period 1 (13/01/26)', 'Period 2 (27-28/01/26)', 202601) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Kitchen Essentials', '2026-02', 'FEBRUARY 2026', 'Period 1 (11/02/26)', 'Period 2 (26/02/26)', 202602) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Washroom Essentials', '2026-02', 'FEBRUARY 2026', 'Period 1 (11/02/26)', 'Period 2 (26/02/26)', 202602) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Snacks', '2026-02', 'FEBRUARY 2026', 'Period 1 (11/02/26)', 'Period 2 (26/02/26)', 202602) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Kitchen Essentials', '2026-03', 'MARCH 2026', 'Period 1 (13/03/26)', 'Period 2 (24-30/03/26)', 202603) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Washroom Essentials', '2026-03', 'MARCH 2026', 'Period 1 (13/03/26)', 'Period 2 (24-30/03/26)', 202603) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Snacks', '2026-03', 'MARCH 2026', 'Period 1 (13/03/26)', 'Period 2 (24-30/03/26)', 202603) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Kitchen Essentials', '2026-04', 'APRIL 2026', 'Period 1 (15/04/26)', 'Period 2 (30/04/26)', 202604) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Washroom Essentials', '2026-04', 'APRIL 2026', 'Period 1 (15/04/26)', 'Period 2 (30/04/26)', 202604) ON CONFLICT (category, month_key) DO NOTHING;
INSERT INTO stock_months (category, month_key, month_label, period_1_label, period_2_label, sort_order) VALUES ('Snacks', '2026-04', 'APRIL 2026', 'Period 1 (15/04/26)', 'Period 2 (30/04/26)', 202604) ON CONFLICT (category, month_key) DO NOTHING;

-- Seed stock_entries
-- We use subqueries to reference stock_items and stock_months by their natural keys
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 18, 0, 18, 18, 0, 0, 18, 18, 0, 18, 18
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Sugar'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 16, 0, 16, 16, 8, 0, 24, 24, 0, 24, 24
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Milk'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 1, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Drinking Chocolate'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 2, 0, 2, 2, 1, 0, 3, 3, 0, 3, 3
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Coffee'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 5, 0, 5, 5, 0, 0, 5, 5, 0, 5, 5
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Tea Leaves'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Matchbox'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Morning Fresh'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Bar Soap'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Super Brite'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Batteries'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 4, 0, 4, 4, 6, 0, 10, 10, 0, 10, 10
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Tissue'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 6, 0, 6, 6, 8, 0, 14, 14, 0, 14, 14
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Serviettes'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 6, 0, 6, 6, 6, 0, 12, 12, 0, 12, 12
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Hand Towels'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 2, 0, 2, 2, 2, 0, 4, 4, 0, 4, 4
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Toilet Balls'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 5, 0, 5, 5, 5, 0, 10, 10, 0, 10, 10
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Liquid Washing Soap'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 2, 0, 2, 2, 0, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Gloves'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Mop'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Hand Wash'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Washroom Soap'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Glass Cleaner'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Jik White'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Jik Coloured'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 2, 0, 2, 2, 0, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Furniture Polish'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Washing Powder'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 2, 0, 3, 3, 0, 3, 3
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Biscuits'
  AND sm.category='Snacks' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 3, 0, 3, 3, 5, 0, 8, 8, 0, 8, 8
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Peanuts'
  AND sm.category='Snacks' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Honey'
  AND sm.category='Snacks' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Hibiscus'
  AND sm.category='Snacks' AND sm.month_key='2025-09'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 10, 0, 10, 10, 0, 0, 10, 10, 0, 10, 10
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Sugar'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 8, 0, 8, 8, 0, 0, 8, 8, 0, 8, 8
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Milk'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Drinking Chocolate'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Coffee'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 2, 0, 2, 2, 0, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Tea Leaves'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Matchbox'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Morning Fresh'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Bar Soap'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Super Brite'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Batteries'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 6, 0, 6, 6, 0, 0, 6, 6, 0, 6, 6
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Tissue'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 8, 0, 8, 8, 0, 0, 8, 8, 0, 8, 8
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Serviettes'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Hand Towels'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Toilet Balls'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Liquid Washing Soap'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Gloves'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Mop'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 6, 0, 6, 6, 0, 0, 6, 6, 0, 6, 6
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Hand Wash'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 2, 0, 2, 2, 0, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Washroom Soap'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 2, 0, 2, 2, 0, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Glass Cleaner'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Jik White'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Jik Coloured'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Furniture Polish'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Washing Powder'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Biscuits'
  AND sm.category='Snacks' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 2, 0, 2, 2, 0, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Peanuts'
  AND sm.category='Snacks' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Honey'
  AND sm.category='Snacks' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Hibiscus'
  AND sm.category='Snacks' AND sm.month_key='2025-10'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 10, 0, 10, 10, 10, 0, 20, 20, 0, 20, 20
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Sugar'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 8, 0, 8, 8, 8, 0, 16, 16, 0, 16, 16
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Milk'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Drinking Chocolate'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 1, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Coffee'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Tea Leaves'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Matchbox'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Morning Fresh'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Bar Soap'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 2, 0, 2, 2, 0, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Super Brite'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 2, 0, 2, 2, 0, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Batteries'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 6, 0, 6, 6, 6, 0, 12, 12, 0, 12, 12
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Tissue'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 8, 0, 8, 8, 8, 0, 16, 16, 0, 16, 16
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Serviettes'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Hand Towels'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Toilet Balls'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 5, 0, 5, 5, 0, 5, 5
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Liquid Washing Soap'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Gloves'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Mop'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Hand Wash'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 3, 0, 3, 3, 0, 3, 3
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Washroom Soap'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Glass Cleaner'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Jik White'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Jik Coloured'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Furniture Polish'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Washing Powder'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 2, 0, 3, 3, 0, 3, 3
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Biscuits'
  AND sm.category='Snacks' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 2, 0, 2, 2, 2, 0, 4, 4, 0, 4, 4
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Peanuts'
  AND sm.category='Snacks' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Honey'
  AND sm.category='Snacks' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Hibiscus'
  AND sm.category='Snacks' AND sm.month_key='2025-11'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 6, 0, 6, 6, 0, 0, 6, 6, 0, 6, 6
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Sugar'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Milk'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Drinking Chocolate'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Coffee'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Tea Leaves'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Matchbox'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Morning Fresh'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Bar Soap'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Super Brite'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Batteries'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 6, 0, 6, 6, 0, 0, 6, 6, 0, 6, 6
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Tissue'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 8, 0, 8, 8, 0, 0, 8, 8, 0, 8, 8
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Serviettes'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Hand Towels'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Toilet Balls'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Liquid Washing Soap'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Gloves'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Mop'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Hand Wash'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Washroom Soap'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Glass Cleaner'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Jik White'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Jik Coloured'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Furniture Polish'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Washing Powder'
  AND sm.category='Washroom Essentials' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Biscuits'
  AND sm.category='Snacks' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 2, 0, 2, 2, 0, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Peanuts'
  AND sm.category='Snacks' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Honey'
  AND sm.category='Snacks' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Hibiscus'
  AND sm.category='Snacks' AND sm.month_key='2025-12'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 10, 0, 10, 10, 8, 0, 18, 18, 0, 18, 18
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Sugar'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 8, 0, 8, 8, 2, 0, 10, 10, 0, 10, 10
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Milk'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 2, 0, 3, 3, 0, 3, 3
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Drinking Chocolate'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 1, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Coffee'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 2, 0, 2, 2, 2, 0, 4, 4, 0, 4, 4
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Tea Leaves'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Matchbox'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Morning Fresh'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Bar Soap'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Super Brite'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Batteries'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 6, 0, 6, 6, 6, 0, 12, 12, 0, 12, 12
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Tissue'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 8, 0, 8, 8, 8, 0, 16, 16, 0, 16, 16
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Serviettes'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Hand Towels'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Toilet Balls'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 5, 0, 5, 5, 0, 0, 5, 5, 0, 5, 5
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Liquid Washing Soap'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Gloves'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Mop'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 6, 0, 6, 6, 0, 0, 6, 6, 0, 6, 6
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Hand Wash'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Washroom Soap'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Glass Cleaner'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Jik White'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Jik Coloured'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Furniture Polish'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Washing Powder'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 2, 0, 3, 3, 0, 3, 3
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Biscuits'
  AND sm.category='Snacks' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Peanuts'
  AND sm.category='Snacks' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Honey'
  AND sm.category='Snacks' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Hibiscus'
  AND sm.category='Snacks' AND sm.month_key='2026-01'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 8, 0, 8, 8, 8, 0, 16, 16, 0, 16, 16
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Sugar'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 9, 0, 9, 9, 9, 0, 18, 18, 0, 18, 18
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Milk'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 1, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Drinking Chocolate'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Coffee'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Tea Leaves'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Matchbox'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Morning Fresh'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Bar Soap'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Super Brite'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Batteries'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 7, 0, 7, 7, 5, 0, 12, 12, 0, 12, 12
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Tissue'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 8, 0, 8, 8, 8, 0, 16, 16, 0, 16, 16
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Serviettes'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 6, 0, 6, 6, 0, 6, 6
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Hand Towels'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Toilet Balls'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 5, 0, 5, 5, 0, 0, 5, 5, 0, 5, 5
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Liquid Washing Soap'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Gloves'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Mop'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Hand Wash'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 6, 0, 6, 6, 0, 6, 6
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Washroom Soap'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 2, 0, 2, 2, 0, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Glass Cleaner'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Jik White'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Jik Coloured'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Furniture Polish'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Washing Powder'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 2, 0, 2, 2, 0, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Biscuits'
  AND sm.category='Snacks' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 2, 0, 2, 2, 0, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Peanuts'
  AND sm.category='Snacks' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Honey'
  AND sm.category='Snacks' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Hibiscus'
  AND sm.category='Snacks' AND sm.month_key='2026-02'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 8, 0, 8, 8, 8, 13, 3, 16, 13, 3, 3
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Sugar'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 9, 0, 9, 9, 9, 0, 18, 18, 0, 18, 18
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Milk'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Drinking Chocolate'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 1, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Coffee'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Tea Leaves'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Matchbox'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Morning Fresh'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Bar Soap'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Super Brite'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Batteries'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 6, 0, 6, 6, 5, 9, 2, 11, 9, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Tissue'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 8, 0, 8, 8, 8, 16, 0, 16, 16, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Serviettes'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Hand Towels'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Toilet Balls'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 5, 0, 5, 5, 0, 5, 5
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Liquid Washing Soap'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 2, 0, 2, 2, 0, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Gloves'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Mop'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 6, 0, 6, 6, 0, 0, 6, 6, 0, 6, 6
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Hand Wash'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 4, 0, 4, 4, 0, 4, 4
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Washroom Soap'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Glass Cleaner'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Jik White'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Jik Coloured'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Furniture Polish'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Washing Powder'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 2, 0, 2, 2, 0, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Biscuits'
  AND sm.category='Snacks' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 2, 0, 2, 2, 0, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Peanuts'
  AND sm.category='Snacks' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Honey'
  AND sm.category='Snacks' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Hibiscus'
  AND sm.category='Snacks' AND sm.month_key='2026-03'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 8, 0, 8, 8, 10, 17, 1, 18, 17, 1, 1
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Sugar'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 10, 0, 10, 10, 10, 20, 0, 20, 20, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Milk'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 1, 0.5, 0.5, 1, 0.5, 0.5, 0.5
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Drinking Chocolate'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 2, 1.5, 0.5, 2, 1.5, 0.5, 0.5
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Coffee'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Tea Leaves'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Matchbox'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 4, 0, 4, 4, 0, 0, 4, 4, 0, 4, 4
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Morning Fresh'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Bar Soap'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 3, 0, 3, 3, 0, 0, 3, 3, 0, 3, 3
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Super Brite'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Kitchen Essentials' AND si.item_name='Batteries'
  AND sm.category='Kitchen Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 4, 0, 4, 4, 6, 7, 3, 10, 7, 3, 3
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Tissue'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 8, 0, 8, 8, 8, 15, 1, 16, 15, 1, 1
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Serviettes'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Hand Towels'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Toilet Balls'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Liquid Washing Soap'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Gloves'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Mop'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Hand Wash'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Washroom Soap'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Glass Cleaner'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Jik White'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Jik Coloured'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Furniture Polish'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Washroom Essentials' AND si.item_name='Washing Powder'
  AND sm.category='Washroom Essentials' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Biscuits'
  AND sm.category='Snacks' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 2, 0, 2, 2, 0, 2, 2
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Peanuts'
  AND sm.category='Snacks' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Honey'
  AND sm.category='Snacks' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;
INSERT INTO stock_entries (stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing)
SELECT si.id, sm.id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
FROM stock_items si, stock_months sm
WHERE si.category='Snacks' AND si.item_name='Hibiscus'
  AND sm.category='Snacks' AND sm.month_key='2026-04'
ON CONFLICT (stock_item_id, month_id) DO NOTHING;

-- Update current_quantity for consumables from latest month (Apr 2026)
UPDATE stock_items si SET current_quantity = se.final_closing
FROM stock_entries se
JOIN stock_months sm ON se.month_id = sm.id
WHERE se.stock_item_id = si.id AND sm.month_key = '2026-04' AND si.is_durable = FALSE;

-- Seed water_deliveries
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2025-09-17', 7, '');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2025-09-23', 7, 'Month total: 14');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2025-10-07', 7, '');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2025-10-10', 9, '');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2025-10-14', 4, '');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2025-10-23', 7, '');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2025-10-29', 6, 'Month total: 33');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2025-11-04', 8, '');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2025-11-11', 8, '');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2025-11-19', 7, '');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2025-11-26', 5, 'Month total: 28');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2025-12-02', 8, '');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2025-12-10', 4, '');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2025-12-16', 7, 'Month total: 19');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2026-01-06', 7, '');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2026-01-13', 9, '');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2026-01-21', 9, '');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2026-01-26', 6, 'Month total: 31');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2026-02-17', 11, '');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2026-02-24', 8, 'Month total: 37');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2026-03-02', 3, '');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2026-03-04', 9, '');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2026-03-17', 8, '');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2026-03-25', 8, 'Month total: 32');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2026-04-01', 9, '');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2026-04-14', 5, '');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2026-04-22', 9, '');
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES ('2026-04-28', 8, 'Month total: 37');

-- ============================================================
-- END OF MIGRATION 007
-- ============================================================
