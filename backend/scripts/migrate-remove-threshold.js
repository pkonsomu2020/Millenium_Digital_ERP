import { supabase } from '../config/supabase.js';

async function runMigration() {
  console.log('🚀 Starting Migration: Remove Threshold Column\n');
  console.log('═'.repeat(60));

  try {
    // Step 1: Check if threshold column exists
    console.log('\n📋 Step 1: Checking current table structure...');
    
    const { data: sampleData, error: checkError } = await supabase
      .from('stock_items')
      .select('*')
      .limit(1);

    if (checkError) {
      throw new Error(`Failed to check table: ${checkError.message}`);
    }

    const columns = sampleData.length > 0 ? Object.keys(sampleData[0]) : [];
    console.log('   Current columns:', columns.join(', '));

    if (!columns.includes('threshold')) {
      console.log('\n✅ Threshold column does not exist - migration already applied!');
      console.log('   No action needed.\n');
      return;
    }

    console.log('\n⚠️  Threshold column found - migration needed!');

    // Step 2: Show migration SQL
    console.log('\n📋 Step 2: Migration SQL Required');
    console.log('─'.repeat(60));
    console.log('ALTER TABLE stock_items DROP COLUMN IF EXISTS threshold;');
    console.log('─'.repeat(60));

    // Step 3: Instructions for manual execution
    console.log('\n📝 MIGRATION INSTRUCTIONS:');
    console.log('═'.repeat(60));
    console.log('\nSince Supabase requires SQL DDL operations to be run via');
    console.log('the SQL Editor, please follow these steps:\n');
    console.log('1. Open your Supabase Dashboard');
    console.log('   URL: https://supabase.com/dashboard/project/YOUR_PROJECT_ID\n');
    console.log('2. Navigate to: SQL Editor (left sidebar)\n');
    console.log('3. Click "New Query"\n');
    console.log('4. Copy and paste this SQL:\n');
    console.log('   ┌─────────────────────────────────────────────────┐');
    console.log('   │ ALTER TABLE stock_items                         │');
    console.log('   │ DROP COLUMN IF EXISTS threshold;                │');
    console.log('   └─────────────────────────────────────────────────┘\n');
    console.log('5. Click "Run" (or press Ctrl+Enter)\n');
    console.log('6. Verify success message appears\n');
    console.log('7. Run this script again to verify migration\n');
    console.log('═'.repeat(60));

    // Step 4: Show verification command
    console.log('\n🔍 After running the SQL, verify with:');
    console.log('   npm run migrate:verify\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 If you encounter issues, you can also:');
    console.log('   - Check your .env file has correct SUPABASE credentials');
    console.log('   - Ensure you have admin access to the database');
    console.log('   - Contact your database administrator\n');
    process.exit(1);
  }
}

// Run the migration check
runMigration();
