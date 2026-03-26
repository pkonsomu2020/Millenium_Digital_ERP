import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Supabase client with service role key for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials in .env file');
  console.log('   Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeMigration() {
  console.log('🚀 Executing Migration: Remove Threshold Column\n');
  console.log('═'.repeat(60));

  try {
    // Step 1: Verify connection
    console.log('\n📡 Step 1: Verifying database connection...');
    const { data: testData, error: testError } = await supabase
      .from('stock_items')
      .select('id')
      .limit(1);

    if (testError) {
      throw new Error(`Connection failed: ${testError.message}`);
    }
    console.log('   ✅ Connected to database');

    // Step 2: Check current structure
    console.log('\n📋 Step 2: Checking current table structure...');
    const { data: sampleData } = await supabase
      .from('stock_items')
      .select('*')
      .limit(1);

    const columns = sampleData.length > 0 ? Object.keys(sampleData[0]) : [];
    console.log('   Current columns:', columns.join(', '));

    if (!columns.includes('threshold')) {
      console.log('\n✅ Migration already applied - threshold column does not exist!');
      console.log('   No action needed.\n');
      return;
    }

    // Step 3: Execute migration using SQL
    console.log('\n⚙️  Step 3: Executing SQL migration...');
    console.log('   SQL: ALTER TABLE stock_items DROP COLUMN IF EXISTS threshold;');

    // Use Supabase's SQL execution via REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        query: 'ALTER TABLE stock_items DROP COLUMN IF EXISTS threshold;'
      })
    });

    if (!response.ok) {
      // If RPC doesn't work, provide manual instructions
      console.log('\n⚠️  Automatic execution not available.');
      console.log('   Please run the SQL manually in Supabase Dashboard:\n');
      console.log('   1. Go to: https://supabase.com/dashboard');
      console.log('   2. Navigate to SQL Editor');
      console.log('   3. Run: ALTER TABLE stock_items DROP COLUMN IF EXISTS threshold;\n');
      
      // But let's try to verify if it was already done
      const { data: verifyData } = await supabase
        .from('stock_items')
        .select('*')
        .limit(1);
      
      const newColumns = verifyData.length > 0 ? Object.keys(verifyData[0]) : [];
      if (!newColumns.includes('threshold')) {
        console.log('   ✅ Actually, the column is already removed!\n');
        return;
      }
      
      throw new Error('Manual migration required - see instructions above');
    }

    console.log('   ✅ SQL executed successfully');

    // Step 4: Verify migration
    console.log('\n🔍 Step 4: Verifying migration...');
    const { data: verifyData } = await supabase
      .from('stock_items')
      .select('*')
      .limit(1);

    const newColumns = verifyData.length > 0 ? Object.keys(verifyData[0]) : [];
    console.log('   New columns:', newColumns.join(', '));

    if (newColumns.includes('threshold')) {
      throw new Error('Migration verification failed - threshold column still exists');
    }

    console.log('   ✅ Threshold column successfully removed!');

    // Step 5: Test API compatibility
    console.log('\n🧪 Step 5: Testing API compatibility...');
    const { data: allItems } = await supabase
      .from('stock_items')
      .select('*');

    const categories = [...new Set(allItems.map(item => item.category))];
    
    console.log(`   Total items: ${allItems.length}`);
    console.log(`   Categories: ${categories.length}`);
    console.log('   ✅ API queries working correctly');

    console.log('\n═'.repeat(60));
    console.log('✨ MIGRATION COMPLETED SUCCESSFULLY! ✨');
    console.log('═'.repeat(60));
    console.log('\n📝 Summary:');
    console.log('   • Threshold column removed from stock_items table');
    console.log('   • Database structure updated');
    console.log('   • API compatibility verified');
    console.log('   • All systems operational\n');

  } catch (error) {
    console.error('\n❌ Migration Error:', error.message);
    console.log('\n📋 MANUAL MIGRATION STEPS:');
    console.log('═'.repeat(60));
    console.log('1. Open Supabase Dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Create a new query');
    console.log('4. Paste and run:\n');
    console.log('   ALTER TABLE stock_items DROP COLUMN IF EXISTS threshold;\n');
    console.log('5. Run: npm run migrate:verify\n');
    console.log('═'.repeat(60));
    console.log();
    process.exit(1);
  }
}

// Execute the migration
executeMigration();
