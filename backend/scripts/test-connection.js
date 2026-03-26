import { supabase } from '../config/supabase.js';

console.log('Testing Supabase connection...\n');

async function testConnection() {
  try {
    // Test connection by querying stock_items table
    const { data, error, count } = await supabase
      .from('stock_items')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.error('\nPlease check:');
      console.error('1. Your .env file has correct SUPABASE_URL and SUPABASE_ANON_KEY');
      console.error('2. You ran the schema.sql in Supabase SQL Editor');
      console.error('3. The stock_items table exists in your database');
      process.exit(1);
    }

    console.log('✅ Connection successful!');
    console.log(`✅ Found ${count} stock items in database`);
    console.log('\nYour backend is ready to use!');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

testConnection();
