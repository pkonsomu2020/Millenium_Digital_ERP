-- Meeting participants / contacts table
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'Admin' CHECK (role IN ('Admin', 'HR')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on meeting_participants" ON meeting_participants
  FOR ALL USING (true) WITH CHECK (true);

-- Seed the admin contacts
INSERT INTO meeting_participants (name, email, role) VALUES
  ('Rose Kirwa',   'Rosekirwa@millenium.co.ke', 'HR'),
  ('Esther Kiilu', 'Ekiilu@afosi.org',           'Admin'),
  ('Winnie',       'Winnie@signvrse.com',         'Admin'),
  ('Muthoni',      'Muthoni@signvrse.com',        'Admin'),
  ('Grace Wanjiru','wanjirugrace678@gmail.com',   'Admin')
ON CONFLICT (email) DO NOTHING;
