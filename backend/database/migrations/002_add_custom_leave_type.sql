-- Migration: Add custom_leave_type column to leave_requests table
-- Date: March 13, 2026
-- Description: Adds support for custom leave types when "Others" is selected

-- Add the custom_leave_type column
ALTER TABLE leave_requests 
ADD COLUMN IF NOT EXISTS custom_leave_type TEXT;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'leave_requests' 
AND column_name = 'custom_leave_type';
