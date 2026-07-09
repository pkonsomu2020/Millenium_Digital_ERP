-- ================================================================
-- FIX: Drop the stray trigger on the users table, then
--      activate all HR users.
--
-- Paste this entire block into Supabase Dashboard → SQL Editor
-- and click Run.
-- ================================================================

-- STEP 1: Drop the broken trigger that references updated_at
--         (the users table has no updated_at column)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- STEP 2: Now safely activate all HR/Admin users
UPDATE users SET is_active = TRUE
WHERE email IN (
  'pkonsomu2021@gmail.com',
  'rosekirwa@millenium.co.ke',
  'ekiilu@afosi.org',
  'winnie@signvrse.com',
  'muthoni@signvrse.com',
  'grace.wanjiru@millenium.co.ke',
  'pachieng@afosi.org'
);

-- STEP 3: Verify all users are now active
SELECT id, name, email, role, is_active
FROM users
ORDER BY role, name;
