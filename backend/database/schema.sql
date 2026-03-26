-- ============================================
-- MILLENIUM DIGITAL ADMIN SYSTEM - DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STOCK MANAGEMENT TABLES
-- ============================================

-- Stock Items Table (Consumables & Durable Items)
CREATE TABLE stock_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'Kitchen Essentials',
    'Washroom Essentials', 
    'Snacks',
    'Water Count',
    'Kitchen Stock',
    'Other Purchases'
  )),
  item_name VARCHAR(100) NOT NULL,
  current_quantity DECIMAL(10, 2) DEFAULT 0,
  unit VARCHAR(20) NOT NULL, -- kg, boxes, tins, pkts, litres, pieces, bottles, rolls
  is_durable BOOLEAN DEFAULT FALSE, -- TRUE for Kitchen Stock items, FALSE for consumables
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category, item_name)
);

-- Purchase History Table (Track all purchases)
CREATE TABLE purchase_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_item_id UUID REFERENCES stock_items(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) DEFAULT 0,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Water Deliveries Table (Separate tracking for water bottles)
CREATE TABLE water_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_date DATE NOT NULL,
  bottles_delivered INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_stock_items_category ON stock_items(category);
CREATE INDEX idx_purchase_history_stock_item ON purchase_history(stock_item_id);
CREATE INDEX idx_purchase_history_date ON purchase_history(purchase_date DESC);
CREATE INDEX idx_water_deliveries_date ON water_deliveries(delivery_date DESC);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stock_items_updated_at
  BEFORE UPDATE ON stock_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA (Based on Excel file)
-- ============================================

-- Kitchen Essentials (Consumables)
INSERT INTO stock_items (category, item_name, current_quantity, unit, is_durable) VALUES
('Kitchen Essentials', 'Sugar', 8, 'kg', FALSE),
('Kitchen Essentials', 'Milk', 9, 'boxes', FALSE),
('Kitchen Essentials', 'Drinking Chocolate', 1, 'tin', FALSE),
('Kitchen Essentials', 'Coffee', 1, 'tin', FALSE),
('Kitchen Essentials', 'Tea leaves', 2, 'bags', FALSE),
('Kitchen Essentials', 'Matchbox', 1, 'pkt', FALSE),
('Kitchen Essentials', 'Super Brite', 2, 'pcs', FALSE),
('Kitchen Essentials', 'Batteries', 2, 'pairs', FALSE);

-- Washroom Essentials (Consumables)
INSERT INTO stock_items (category, item_name, current_quantity, unit, is_durable) VALUES
('Washroom Essentials', 'Tissue', 5, 'pkts', FALSE),
('Washroom Essentials', 'Serviettes', 8, 'pkts', FALSE),
('Washroom Essentials', 'Hand Towels', 6, 'pkts', FALSE),
('Washroom Essentials', 'Toilet Balls', 2, 'pkts', FALSE),
('Washroom Essentials', 'Liquid Washing Soap', 5, 'litres', FALSE),
('Washroom Essentials', 'Gloves', 2, 'pairs', FALSE),
('Washroom Essentials', 'Mop', 1, 'pcs', FALSE),
('Washroom Essentials', 'Hand Wash', 6, 'bottles', FALSE),
('Washroom Essentials', 'Washroom Soap', 3, 'bars', FALSE),
('Washroom Essentials', 'Glass Cleaner', 2, 'bottles', FALSE),
('Washroom Essentials', 'Jik (White)', 1, 'bottle', FALSE),
('Washroom Essentials', 'Jik (Coloured)', 1, 'bottle', FALSE),
('Washroom Essentials', 'Furniture Polish', 1, 'bottle', FALSE),
('Washroom Essentials', 'Washing Powder', 2, 'pkts', FALSE),
('Washroom Essentials', 'Sufuria', 1, 'pcs', FALSE);

-- Snacks (Consumables)
INSERT INTO stock_items (category, item_name, current_quantity, unit, is_durable) VALUES
('Snacks', 'Biscuits', 2, 'tins', FALSE),
('Snacks', 'Peanuts', 2, 'pkts', FALSE),
('Snacks', 'Honey', 2, 'tins', FALSE),
('Snacks', 'Hibiscus', 2, 'pkts', FALSE);

-- Kitchen Stock (Durable Items)
INSERT INTO stock_items (category, item_name, current_quantity, unit, is_durable, notes) VALUES
('Kitchen Stock', 'Plates', 6, 'pcs', TRUE, 'SIGNVRSE'),
('Kitchen Stock', 'Side Plates', 8, 'pcs', TRUE, 'AFOSI'),
('Kitchen Stock', 'Spoons', 13, 'pcs', TRUE, 'AFOSI'),
('Kitchen Stock', 'Tea Spoons', 4, 'pcs', TRUE, 'MILLENIUM'),
('Kitchen Stock', 'Forks', 5, 'pcs', TRUE, 'AFOSI'),
('Kitchen Stock', 'Glasses', 22, 'pcs', TRUE, 'MILLENIUM'),
('Kitchen Stock', 'Cups', 18, 'pcs', TRUE, 'MILLENIUM'),
('Kitchen Stock', 'Thermos', 10, 'pcs', TRUE, ''),
('Kitchen Stock', 'Glass Jugs', 5, 'pcs', TRUE, ''),
('Kitchen Stock', 'Plastic Jugs', 3, 'pcs', TRUE, ''),
('Kitchen Stock', 'Serving Trays', 6, 'pcs', TRUE, ''),
('Kitchen Stock', 'Tumblers', 13, 'pcs', TRUE, ''),
('Kitchen Stock', 'Sufurias (Pots)', 3, 'pcs', TRUE, ''),
('Kitchen Stock', 'Buckets', 5, 'pcs', TRUE, ''),
('Kitchen Stock', 'Dustbins', 16, 'pcs', TRUE, ''),
('Kitchen Stock', 'Salt Shakers', 3, 'pcs', TRUE, ''),
('Kitchen Stock', 'Kitchen Towels', 6, 'pkts', TRUE, ''),
('Kitchen Stock', 'Pegs', 10, 'pcs', TRUE, ''),
('Kitchen Stock', 'Cloth Line', 1, 'pcs', TRUE, ''),
('Kitchen Stock', 'Scrubbing Brush', 1, 'pcs', TRUE, '');

-- Water Count (Special tracking)
INSERT INTO stock_items (category, item_name, current_quantity, unit, is_durable) VALUES
('Water Count', 'Dispenser Bottles', 7, 'bottles', FALSE);

-- Sample Water Deliveries
INSERT INTO water_deliveries (delivery_date, bottles_delivered, notes) VALUES
('2026-02-11', 6, ''),
('2026-02-13', 2, ''),
('2026-02-17', 11, ''),
('2026-02-25', 8, ''),
('2026-03-04', 9, ''),
('2026-03-10', 7, 'Latest delivery');

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_deliveries ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all stock data
CREATE POLICY "Allow authenticated read access" ON stock_items
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow authenticated read access" ON purchase_history
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow authenticated read access" ON water_deliveries
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated write access" ON stock_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated write access" ON purchase_history
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated write access" ON water_deliveries
  FOR ALL USING (auth.role() = 'authenticated');
