import { supabase } from '../config/supabase.js';

async function verifyMigration() {
  console.log('🔍 Verifying Migration: Threshold Column Removal\n');
  console.log('═'.repeat(60));

  try {
    // Fetch a sample item to check structure
    const { data, error } = await supabase
      .from('stock_items')
      .select('*')
      .limit(1);

    if (error) {
      throw new Error(`Failed to query table: ${error.message}`);
    }

    if (data.length === 0) {
      console.log('⚠️  Warning: No data in stock_items table');
      console.log('   Cannot verify column structure\n');
      return;
    }

    const columns = Object.keys(data[0]);
    
    console.log('\n📊 Current Table Structure:');
    console.log('─'.repeat(60));
    console.log('Columns:', columns.length);
    console.log('─'.repeat(60));
    
    columns.forEach((col, index) => {
      const value = data[0][col];
      const type = typeof value;
      console.log(`${(index + 1).toString().padStart(2)}. ${col.padEnd(20)} (${type})`);
    });
    
    console.log('─'.repeat(60));

    // Check if threshold exists
    if (columns.includes('threshold')) {
      console.log('\n❌ MIGRATION NOT APPLIED');
      console.log('   The "threshold" column still exists in the table.');
      console.log('\n   Please run the migration SQL in Supabase Dashboard:');
      console.log('   ALTER TABLE stock_items DROP COLUMN IF EXISTS threshold;\n');
      process.exit(1);
    } else {
      console.log('\n✅ MIGRATION SUCCESSFUL');
      console.log('   The "threshold" column has been removed.');
      
      // Verify expected columns exist
      const expectedColumns = [
        'id', 'category', 'item_name', 'current_quantity', 
        'unit', 'is_durable', 'notes', 'created_at', 'updated_at'
      ];
      
      const missingColumns = expectedColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('\n⚠️  Warning: Some expected columns are missing:');
        missingColumns.forEach(col => console.log(`   - ${col}`));
      } else {
        console.log('   All expected columns are present.');
      }
      
      console.log('\n✨ Database structure is correct!\n');
    }

    // Test stats endpoint
    console.log('🧪 Testing API Compatibility...');
    console.log('─'.repeat(60));
    
    const { data: allItems, error: statsError } = await supabase
      .from('stock_items')
      .select('*');

    if (statsError) {
      throw new Error(`Stats query failed: ${statsError.message}`);
    }

    const categories = [...new Set(allItems.map(item => item.category))];
    
    console.log(`Total Items: ${allItems.length}`);
    console.log(`Categories: ${categories.length}`);
    console.log(`Category List: ${categories.join(', ')}`);
    console.log('─'.repeat(60));
    console.log('✅ API queries working correctly\n');

  } catch (error) {
    console.error('\n❌ Verification Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   - Check your .env file has correct credentials');
    console.log('   - Ensure database connection is working');
    console.log('   - Verify table exists: stock_items\n');
    process.exit(1);
  }
}

// Run verification
verifyMigration();
