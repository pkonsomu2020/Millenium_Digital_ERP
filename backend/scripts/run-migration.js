import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log('🚀 Starting database migration...\n');

  try {
    // Read the migration file
    const migrationPath = join(__dirname, '../database/migrations/001_remove_threshold_column.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded: 001_remove_threshold_column.sql');
    console.log('📝 SQL to execute:');
    console.log('─'.repeat(60));
    console.log(migrationSQL);
    console.log('─'.repeat(60));
    console.log();

    // Execute the migration
    console.log('⏳ Executing migration...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    });

    if (error) {
      // If the RPC function doesn't exist, try direct SQL execution
      console.log('⚠️  RPC method not available, trying direct execution...');
      
      // Split SQL by semicolons and execute each statement
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.includes('DROP COLUMN')) {
          console.log('🔧 Dropping threshold column...');
          
          // Use Supabase's query method
          const { error: dropError } = await supabase
            .from('stock_items')
            .select('threshold')
            .limit(1);

          if (!dropError) {
            console.log('✅ Threshold column exists, proceeding with drop...');
            // Note: Direct column drop requires SQL execution via Supabase dashboard
            throw new Error('Please run this migration via Supabase SQL Editor. See instructions below.');
          } else if (dropError.message.includes('column') && dropError.message.includes('does not exist')) {
            console.log('✅ Threshold column already removed - migration not needed!');
            return;
          }
        }
      }
    } else {
      console.log('✅ Migration executed successfully!');
    }

    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    
    const { data: testData, error: testError } = await supabase
      .from('stock_items')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ Verification failed:', testError.message);
    } else {
      const columns = testData.length > 0 ? Object.keys(testData[0]) : [];
      console.log('📊 Current table columns:', columns.join(', '));
      
      if (columns.includes('threshold')) {
        console.log('⚠️  WARNING: Threshold column still exists!');
      } else {
        console.log('✅ Threshold column successfully removed!');
      }
    }

    console.log('\n✨ Migration process completed!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\n📋 MANUAL MIGRATION INSTRUCTIONS:');
    console.log('─'.repeat(60));
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the following SQL:');
    console.log();
    console.log('   ALTER TABLE stock_items DROP COLUMN IF EXISTS threshold;');
    console.log();
    console.log('4. Click "Run" to execute');
    console.log('─'.repeat(60));
    console.log();
    process.exit(1);
  }
}

// Run the migration
runMigration();
