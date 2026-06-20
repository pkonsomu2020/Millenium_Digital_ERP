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
INSERT INTO meeting_participants (name, email, role, is_active) VALUES
  ('Grace Wanjiru', 'grace.wanjiru@millenium.co.ke', 'Admin', TRUE),
  ('Rose Kirwa',    'rosekirwa@millenium.co.ke',     'HR',    FALSE),
  ('Ekiilu',        'ekiilu@afosi.org',               'HR',    FALSE),
  ('Winnie',        'winnie@signvrse.com',             'HR',    FALSE),
  ('Muthoni',       'muthoni@signvrse.com',            'HR',    FALSE)
ON CONFLICT (email) DO UPDATE
  SET is_active = EXCLUDED.is_active,
      role = EXCLUDED.role;
