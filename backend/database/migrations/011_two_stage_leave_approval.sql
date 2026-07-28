-- Migration 011: Two-stage leave approval (Esther reviews first, then Rose gives final approval)
--
-- Adds separate stage1 (Esther) / stage2 (Rose) review columns to leave_requests.
-- The existing status / reviewed_by / reviewed_on / hr_remarks / hr_signature / deferred_date
-- columns remain the single source of truth for the FINAL decision — they only change when
-- stage 2 (Rose) completes. Stage 1 alone never moves the overall status off 'Pending'.
--
-- Paste this entire block into Supabase Dashboard -> SQL Editor and click Run.

ALTER TABLE leave_requests
  ADD COLUMN IF NOT EXISTS stage1_status TEXT DEFAULT 'Pending' CHECK (stage1_status IN ('Pending', 'Approved', 'Rejected', 'Deferred')),
  ADD COLUMN IF NOT EXISTS stage1_reviewed_by TEXT,
  ADD COLUMN IF NOT EXISTS stage1_reviewed_on TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stage1_remarks TEXT,
  ADD COLUMN IF NOT EXISTS stage1_signature TEXT,
  ADD COLUMN IF NOT EXISTS stage2_status TEXT DEFAULT 'Pending' CHECK (stage2_status IN ('Pending', 'Approved', 'Rejected', 'Deferred')),
  ADD COLUMN IF NOT EXISTS stage2_reviewed_by TEXT,
  ADD COLUMN IF NOT EXISTS stage2_reviewed_on TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stage2_remarks TEXT,
  ADD COLUMN IF NOT EXISTS stage2_signature TEXT;

-- Backfill: leave requests already decided under the old single-stage flow get the
-- same decision recorded on both stages, so they display consistently in the new
-- two-stage view instead of looking like nobody ever reviewed them.
UPDATE leave_requests
SET
  stage1_status = status,
  stage1_reviewed_by = reviewed_by,
  stage1_reviewed_on = reviewed_on,
  stage1_remarks = hr_remarks,
  stage1_signature = hr_signature,
  stage2_status = status,
  stage2_reviewed_by = reviewed_by,
  stage2_reviewed_on = reviewed_on,
  stage2_remarks = hr_remarks,
  stage2_signature = hr_signature
WHERE status <> 'Pending';
