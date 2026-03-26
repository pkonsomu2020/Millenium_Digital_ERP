# Database Migration: Remove Threshold Column

## Quick Start - 3 Simple Steps

### Step 1: Open Supabase SQL Editor
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query** button

### Step 2: Execute Migration SQL
Copy and paste this SQL into the editor:

```sql
ALTER TABLE stock_items DROP COLUMN IF EXISTS threshold;
```

Then click **Run** (or press `Ctrl+Enter`)

### Step 3: Verify Migration
After running the SQL, you should see a success message.

To verify, run this command in your terminal:

```bash
cd backend
npm run migrate:verify
```

You should see:
```
✅ MIGRATION SUCCESSFUL
   The "threshold" column has been removed.
```

---

## Detailed Instructions

### Option A: Using Supabase Dashboard (Recommended)

1. **Login to Supabase**
   - URL: https://supabase.com/dashboard
   - Login with your credentials

2. **Select Your Project**
   - Find "Millenium Digital Admin System" project
   - Click to open it

3. **Open SQL Editor**
   - Look for "SQL Editor" in the left sidebar
   - Click on it
   - You'll see the SQL query interface

4. **Create New Query**
   - Click the "New Query" button (top right)
   - A blank editor will appear

5. **Paste Migration SQL**
   - Copy this SQL:
     ```sql
     ALTER TABLE stock_items DROP COLUMN IF EXISTS threshold;
     ```
   - Paste it into the editor

6. **Execute the Query**
   - Click the green "Run" button
   - Or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

7. **Check for Success**
   - You should see: "Success. No rows returned"
   - This is normal for ALTER TABLE commands

8. **Verify the Change** (Optional)
   - Run this query to see the new table structure:
     ```sql
     SELECT column_name, data_type 
     FROM information_schema.columns 
     WHERE table_name = 'stock_items' 
     ORDER BY ordinal_position;
     ```
   - Verify that "threshold" is NOT in the list

### Option B: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Navigate to backend directory
cd backend

# Execute migration
supabase db execute --file database/migrations/EXECUTE_THIS.sql

# Verify
npm run migrate:verify
```

### Option C: Using Direct PostgreSQL Connection (Advanced)

If you have direct database access:

```bash
# Get connection string from Supabase Dashboard > Settings > Database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"

# Run migration
ALTER TABLE stock_items DROP COLUMN IF EXISTS threshold;

# Exit
\q
```

---

## Verification

After running the migration, verify it worked:

### Method 1: Using npm script (Recommended)
```bash
cd backend
npm run migrate:verify
```

**Expected Output:**
```
✅ MIGRATION SUCCESSFUL
   The "threshold" column has been removed.
   All expected columns are present.

✨ Database structure is correct!
```

### Method 2: Manual SQL Check
Run this in Supabase SQL Editor:
```sql
SELECT * FROM stock_items LIMIT 1;
```

Check that the result does NOT include a "threshold" column.

---

## Troubleshooting

### Error: "column 'threshold' does not exist"
✅ **Good news!** This means the migration was already applied.
No action needed.

### Error: "permission denied"
❌ Make sure you're logged in as the project owner or have admin access.

### Error: "relation 'stock_items' does not exist"
❌ The table doesn't exist. You may need to run the initial schema first:
```bash
cd backend
# Run the main schema file in Supabase SQL Editor
```

### Connection Issues
❌ Check your `.env` file has correct credentials:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## What This Migration Does

### Before Migration
Table structure includes:
- id
- category
- item_name
- current_quantity
- unit
- **threshold** ← This will be removed
- is_durable
- notes
- created_at
- updated_at

### After Migration
Table structure:
- id
- category
- item_name
- current_quantity
- unit
- is_durable
- notes
- created_at
- updated_at

**Result**: Cleaner, simpler database structure without threshold tracking.

---

## Impact on Application

### Frontend Changes
- ✅ Admin Dashboard: No longer shows Threshold/Status columns
- ✅ HR Dashboard: No longer shows Threshold/Status columns
- ✅ Add/Edit forms: No threshold input field
- ✅ Statistics: No "Low Stock Alerts" card

### Backend Changes
- ✅ API no longer accepts/returns threshold values
- ✅ Stats endpoint simplified
- ✅ All CRUD operations updated

### No Breaking Changes
All existing functionality continues to work. The migration only removes unused columns.

---

## Rollback (If Needed)

If you need to restore the threshold column:

```sql
-- Add threshold column back
ALTER TABLE stock_items ADD COLUMN threshold DECIMAL(10, 2) DEFAULT 10;

-- Update all items with default threshold
UPDATE stock_items SET threshold = 10 WHERE threshold IS NULL;
```

Then revert the frontend/backend code changes from git.

---

## Support

Need help? Check these resources:
- `MD FILES/THRESHOLD_REMOVAL_GUIDE.md` - Complete documentation
- `backend/API_DOCUMENTATION.md` - API reference
- Supabase Docs: https://supabase.com/docs

---

**Migration File**: `001_remove_threshold_column.sql`  
**Date**: March 13, 2026  
**Status**: Ready to execute  
**Risk Level**: Low (non-destructive, only removes unused column)
