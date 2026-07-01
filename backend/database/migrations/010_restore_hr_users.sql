-- ================================================================
-- RESTORE HR USERS + FIX PETER
-- Run this in Supabase Dashboard → SQL Editor
-- ================================================================

-- 1. Activate all HR users (Rose, Ekiilu, Winnie, Muthoni)
--    These were already activated by the script, but run for safety.
UPDATE users SET is_active = TRUE
WHERE email IN (
  'rosekirwa@millenium.co.ke',
  'ekiilu@afosi.org',
  'winnie@signvrse.com',
  'muthoni@signvrse.com'
);

-- 2. Fix Peter — his record may have a trigger issue.
--    Directly update via SQL to bypass any trigger problems.
UPDATE users SET is_active = TRUE
WHERE email = 'pkonsomu2021@gmail.com';

-- 3. Verify
SELECT id, name, email, role, is_active, created_at
FROM users
ORDER BY created_at;
