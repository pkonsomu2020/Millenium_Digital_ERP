-- Migration: Update leave_requests to match full leave document form
ALTER TABLE leave_requests
  ADD COLUMN IF NOT EXISTS manager TEXT,
  ADD COLUMN IF NOT EXISTS contact_while_on_leave TEXT,
  ADD COLUMN IF NOT EXISTS days_applied INTEGER,
  ADD COLUMN IF NOT EXISTS days_accrued INTEGER,
  ADD COLUMN IF NOT EXISTS leave_balance INTEGER,
  ADD COLUMN IF NOT EXISTS balance_bf INTEGER,
  ADD COLUMN IF NOT EXISTS handover_reviewed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS handover_notes TEXT,
  ADD COLUMN IF NOT EXISTS employee_signature TEXT,
  ADD COLUMN IF NOT EXISTS hr_signature TEXT,
  ADD COLUMN IF NOT EXISTS hr_remarks TEXT,
  ADD COLUMN IF NOT EXISTS deferred_date DATE;

-- Rename days -> days_applied if it exists (safe approach)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='leave_requests' AND column_name='days'
  ) THEN
    ALTER TABLE leave_requests RENAME COLUMN days TO days_applied;
  END IF;
END $$;

-- Add Deferred to status check
ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS leave_requests_status_check;
ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_status_check
  CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Deferred'));
