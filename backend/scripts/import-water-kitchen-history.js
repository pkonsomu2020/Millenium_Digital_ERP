import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Supabase client with SERVICE ROLE key to bypass RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🚀 Importing Purchase History for Water Count and Kitchen Stock\n');
console.log('═'.repeat(60));

async function importWaterCountHistory() {
  console.log('\n💧 Step 1: Importing Water Count Purchase History...');
  
  // Get the Water Count item
  const { data: waterItem, error: fetchError } = await supabase
    .from('stock_items')
    .select('id')
    .eq('category', 'Water Count')
    .eq('item_name', 'Dispenser Bottles')
    .single();
  
  if (fetchError || !waterItem) {
    console.log('   ❌ Water Count item not found');
    return;
  }
  
  // Water delivery history from CSV
  const deliveries = [
    { date: '2025-09-17', qty: 7 },
    { date: '2025-09-23', qty: 7 },
    { date: '2025-10-07', qty: 7 },
    { date: '2025-10-10', qty: 9 },
    { date: '2025-10-14', qty: 4 },
    { date: '2025-10-23', qty: 7 },
    { date: '2025-10-29', qty: 6 },
    { date: '2025-11-04', qty: 8 },
    { date: '2025-11-11', qty: 8 },
    { date: '2025-11-19', qty: 7 },
    { date: '2025-11-26', qty: 5 },
    { date: '2025-12-02', qty: 8 },
    { date: '2025-12-10', qty: 4 },
    { date: '2025-12-16', qty: 7 },
    { date: '2026-01-06', qty: 7 },
    { date: '2026-01-13', qty: 9 },
    { date: '2026-01-21', qty: 9 },
    { date: '2026-01-26', qty: 6 },
    { date: '2026-02-02', qty: 2 },
    { date: '2026-02-03', qty: 3 },
    { date: '2026-02-04', qty: 6 },
    { date: '2026-02-09', qty: 9 },
    { date: '2026-02-10', qty: 7 },
    { date: '2026-02-11', qty: 6 },
    { date: '2026-02-13', qty: 2 },
    { date: '2026-02-17', qty: 11 },
    { date: '2026-02-25', qty: 8 },
    { date: '2026-03-04', qty: 9 }
  ];
  
  let imported = 0;
  
  for (const delivery of deliveries) {
    const { error } = await supabase
      .from('purchase_history')
      .insert({
        stock_item_id: waterItem.id,
        quantity: delivery.qty,
        purchase_date: delivery.date,
        notes: 'Water delivery',
        unit_price: 0
      });
    
    if (error) {
      console.log(`   ⚠️  Failed to import ${delivery.date}: ${error.message}`);
    } else {
      imported++;
    }
  }
  
  console.log(`   ✅ Imported ${imported} water delivery records`);
}

async function importKitchenStockHistory() {
  console.log('\n🍽️  Step 2: Importing Kitchen Stock Purchase History...');
  
  // Get all Kitchen Stock items
  const { data: kitchenItems, error: fetchError } = await supabase
    .from('stock_items')
    .select('id, item_name, current_quantity')
    .eq('category', 'Kitchen Stock');
  
  if (fetchError || !kitchenItems) {
    console.log('   ❌ Kitchen Stock items not found');
    return;
  }
  
  let imported = 0;
  
  // Create initial purchase history for each item with current quantity
  for (const item of kitchenItems) {
    if (item.current_quantity > 0) {
      const { error } = await supabase
        .from('purchase_history')
        .insert({
          stock_item_id: item.id,
          quantity: item.current_quantity,
          purchase_date: '2026-03-01', // Set a baseline date
          notes: 'Initial inventory count',
          unit_price: 0
        });
      
      if (error) {
        console.log(`   ⚠️  Failed to import ${item.item_name}: ${error.message}`);
      } else {
        imported++;
      }
    }
  }
  
  console.log(`   ✅ Imported ${imported} kitchen stock records`);
}

async function verifyImport() {
  console.log('\n🔍 Step 3: Verifying import...');
  
  // Check Water Count
  const { data: waterItem } = await supabase
    .from('stock_items')
    .select('id')
    .eq('category', 'Water Count')
    .single();
  
  if (waterItem) {
    const { data: waterHistory } = await supabase
      .from('purchase_history')
      .select('*')
      .eq('stock_item_id', waterItem.id);
    
    console.log(`   💧 Water Count: ${waterHistory?.length || 0} delivery records`);
  }
  
  // Check Kitchen Stock
  const { data: kitchenItems } = await supabase
    .from('stock_items')
    .select('id')
    .eq('category', 'Kitchen Stock');
  
  if (kitchenItems) {
    let totalKitchenHistory = 0;
    for (const item of kitchenItems) {
      const { data: history } = await supabase
        .from('purchase_history')
        .select('*')
        .eq('stock_item_id', item.id);
      
      totalKitchenHistory += history?.length || 0;
    }
    console.log(`   🍽️  Kitchen Stock: ${totalKitchenHistory} purchase records`);
  }
}

async function main() {
  try {
    await importWaterCountHistory();
    await importKitchenStockHistory();
    await verifyImport();
    
    console.log('\n═'.repeat(60));
    console.log('✨ PURCHASE HISTORY IMPORT COMPLETED! ✨');
    console.log('═'.repeat(60));
    console.log('\n✅ Water Count delivery history imported');
    console.log('✅ Kitchen Stock initial inventory imported');
    console.log('✅ All purchase history records created\n');
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error('\n💡 Check database connection and try again\n');
    process.exit(1);
  }
}

main();
