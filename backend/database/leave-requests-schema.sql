-- Leave Requests table (full leave document form)
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Employee details
  employee_name TEXT NOT NULL,
  employee_email TEXT NOT NULL,
  manager TEXT,
  contact_while_on_leave TEXT,

  -- Leave details
  leave_type TEXT NOT NULL,
  custom_leave_type TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_applied INTEGER NOT NULL,
  days_accrued INTEGER,
  leave_balance INTEGER,
  balance_bf INTEGER,

  -- Reason
  reason TEXT NOT NULL,

  -- Handover
  handover_reviewed BOOLEAN DEFAULT FALSE,
  handover_notes TEXT,

  -- Submission
  submitted_by TEXT NOT NULL,
  submitted_on TIMESTAMPTZ DEFAULT NOW(),
  employee_signature TEXT,

  -- HR Review
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Deferred')),
  reviewed_by TEXT,
  reviewed_on TIMESTAMPTZ,
  hr_signature TEXT,
  hr_remarks TEXT,
  deferred_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on leave_requests" ON leave_requests
  FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_submitted_on ON leave_requests(submitted_on DESC);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_email ON leave_requests(employee_email);
