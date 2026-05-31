-- Migration 008: Add dual-period tables WITHOUT dropping existing stock_items / water_deliveries.
-- Run this in Supabase SQL Editor if you cannot run the full 007 migration yet.
-- Then: cd backend && npm run seed:stock:007 && npm run verify:stock

ALTER TABLE stock_items
  ADD COLUMN IF NOT EXISTS purchased_qty DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS broken_lost_qty DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_qty DECIMAL(10,2) DEFAULT 0;

ALTER TABLE stock_items DROP COLUMN IF EXISTS threshold;

CREATE TABLE IF NOT EXISTS stock_months (
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

CREATE TABLE IF NOT EXISTS stock_entries (
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

CREATE TABLE IF NOT EXISTS purchase_date_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  purchase_date DATE NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, purchase_date)
);

CREATE INDEX IF NOT EXISTS idx_stock_months_category_key ON stock_months(category, month_key);
CREATE INDEX IF NOT EXISTS idx_stock_entries_item ON stock_entries(stock_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_entries_month ON stock_entries(month_id);

ALTER TABLE stock_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_date_comments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all on stock_months') THEN
    CREATE POLICY "Allow all on stock_months" ON stock_months FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all on stock_entries') THEN
    CREATE POLICY "Allow all on stock_entries" ON stock_entries FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all on purchase_date_comments') THEN
    CREATE POLICY "Allow all on purchase_date_comments" ON purchase_date_comments FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
