-- Documents table for Document Vault
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  category TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  file_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Minutes table for Minutes Upload
CREATE TABLE IF NOT EXISTS meeting_minutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  meeting_date DATE NOT NULL,
  meeting_title TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  file_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_minutes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents
CREATE POLICY "Allow all operations on documents" ON documents
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for meeting_minutes
CREATE POLICY "Allow all operations on meeting_minutes" ON meeting_minutes
  FOR ALL USING (true) WITH CHECK (true);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON documents(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_meeting_minutes_meeting_date ON meeting_minutes(meeting_date DESC);
CREATE INDEX IF NOT EXISTS idx_meeting_minutes_upload_date ON meeting_minutes(upload_date DESC);
