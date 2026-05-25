-- ============================================================
-- MIGRATION 006: Add Peter Onsomu as HR user
-- Date: 2026-05-25
-- Description: Adds pkonsomu2021@gmail.com to:
--   1. meeting_participants — receives meeting invite emails
--   2. users — can log in to HR dashboard
--              (password hash must be inserted via script)
-- ============================================================

-- 1. Add to meeting_participants so he receives meeting emails
INSERT INTO meeting_participants (name, email, role, is_active)
VALUES ('Peter Onsomu', 'pkonsomu2021@gmail.com', 'HR', TRUE)
ON CONFLICT (email) DO UPDATE
  SET name = 'Peter Onsomu',
      role = 'HR',
      is_active = TRUE;

-- 2. NOTE: The users table requires a bcrypt password_hash.
--    Run the script below instead of inserting directly here:
--    node backend/scripts/add-peter-user.js
