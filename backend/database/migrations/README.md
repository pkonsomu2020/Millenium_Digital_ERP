# Database Migrations

This folder contains database migration scripts for the Millenium Digital Admin System.

## Available Migrations

### 001_remove_threshold_column.sql
**Date**: March 13, 2026  
**Description**: Removes the threshold column from the stock_items table as it's no longer needed for stock management.

**What it does**:
- Drops the `threshold` column from `stock_items` table
- Cleans up the database structure

**When to run**: 
- If you have an existing database with the threshold column
- Skip this if you're setting up a fresh database (the main schema.sql already excludes threshold)

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Log in to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the migration file
4. Paste and execute the SQL

### Option 2: Supabase CLI
```bash
# Make sure you're in the backend directory
cd backend

# Run the migration
supabase db execute --file database/migrations/001_remove_threshold_column.sql
```

### Option 3: Direct PostgreSQL Connection
```bash
# Connect to your database
psql -h your-supabase-host -U postgres -d postgres

# Run the migration
\i database/migrations/001_remove_threshold_column.sql
```

## Migration Status Tracking

Keep track of which migrations have been applied to your database:

| Migration | Production | Staging | Local Dev |
|-----------|-----------|---------|-----------|
| 001_remove_threshold_column.sql | ⬜ Pending | ⬜ Pending | ⬜ Pending |

Update this table after applying migrations to each environment.

## Best Practices

1. **Backup First**: Always backup your database before running migrations
2. **Test Locally**: Run migrations on your local/dev environment first
3. **Review Changes**: Read through the migration SQL before executing
4. **Check Dependencies**: Ensure the backend code is updated before running migrations
5. **Verify Results**: After migration, test the affected features

## Rollback Instructions

If you need to rollback the threshold removal:

```sql
-- Add the threshold column back
ALTER TABLE stock_items ADD COLUMN threshold DECIMAL(10, 2) DEFAULT 10;

-- Recreate the index
CREATE INDEX idx_stock_items_low_stock ON stock_items(current_quantity, threshold);

-- Update existing items with default threshold
UPDATE stock_items SET threshold = 10 WHERE threshold IS NULL;
```

## Support

For migration issues or questions:
- Check `MD FILES/THRESHOLD_REMOVAL_GUIDE.md` for detailed documentation
- Review `backend/ARCHITECTURE.md` for system architecture
- Contact the development team

---

**Note**: Always coordinate migrations with code deployments to avoid breaking changes.
