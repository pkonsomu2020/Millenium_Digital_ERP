-- Migration 009: Alter leave_requests column types to support decimals
-- Since days_accrued can be fractional (e.g., month * 1.75 -> 8.75), we change it and related fields from INTEGER to NUMERIC.

ALTER TABLE leave_requests ALTER COLUMN days_accrued TYPE NUMERIC(5,2);
ALTER TABLE leave_requests ALTER COLUMN leave_balance TYPE NUMERIC(5,2);
ALTER TABLE leave_requests ALTER COLUMN balance_bf TYPE NUMERIC(5,2);
