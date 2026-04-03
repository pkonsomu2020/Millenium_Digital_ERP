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

-- Seed participants
INSERT INTO meeting_participants (name, email, role) VALUES
  ('Grace Wanjiru', 'grace.wanjiru@millenium.co.ke', 'Admin'),
  ('Rose Kirwa',    'rosekirwa@millenium.co.ke',     'HR'),
  ('Ekiilu',        'ekiilu@afosi.org',               'HR'),
  ('Winnie',        'winnie@signvrse.com',             'HR'),
  ('Muthoni',       'muthoni@signvrse.com',            'HR')
ON CONFLICT (email) DO NOTHING;
