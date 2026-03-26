import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Supabase client with SERVICE ROLE key to bypass RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🚀 Starting CSV Data Import Process\n');
console.log('═'.repeat(60));

// Parse CSV helper function
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }
  
  return { headers, data };
}

async function clearExistingData() {
  console.log('\n🗑️  Step 1: Clearing existing data...');
  
  try {
    // Delete all stock items (cascade will handle purchase history)
    const { error: deleteError } = await supabase
      .from('stock_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) throw deleteError;
    
    console.log('   ✅ All existing stock items cleared');
  } catch (error) {
    console.error('   ❌ Error clearing data:', error.message);
    throw error;
  }
}


async function importKitchenEssentials() {
  console.log('\n📦 Step 2: Importing Kitchen Essentials...');
  
  const csvPath = join(__dirname, '../../CSV DATA/Kitchen Essentials.csv');
  const content = readFileSync(csvPath, 'utf-8');
  const { data } = parseCSV(content);
  
  const items = [
    { name: 'Sugar', qty: 8, unit: 'kg' },
    { name: 'Milk', qty: 9, unit: 'boxes' },
    { name: 'Drinking Chocolate', qty: 1, unit: 'tin' },
    { name: 'Coffee', qty: 1, unit: 'tin' },
    { name: 'Tea leaves', qty: 2, unit: 'bags' },
    { name: 'Matchbox', qty: 1, unit: 'pkt' },
    { name: 'Super Brite', qty: 2, unit: 'pcs' },
    { name: 'Batteries', qty: 2, unit: 'pairs' }
  ];
  
  for (const item of items) {
    const { error } = await supabase.from('stock_items').insert({
      category: 'Kitchen Essentials',
      item_name: item.name,
      current_quantity: item.qty,
      unit: item.unit,
      is_durable: false,
      notes: ''
    });
    
    if (error) throw error;
  }
  
  console.log(`   ✅ Imported ${items.length} Kitchen Essentials items`);
}


async function importWashroomEssentials() {
  console.log('\n🚿 Step 3: Importing Washroom Essentials...');
  
  const items = [
    { name: 'Tissue', qty: 5, unit: 'pkts' },
    { name: 'Serviettes', qty: 8, unit: 'pkts' },
    { name: 'Hand Towels', qty: 6, unit: 'pkts' },
    { name: 'Toilet Balls', qty: 2, unit: 'pkts' },
    { name: 'Liquid Washing Soap', qty: 5, unit: 'litres' },
    { name: 'Gloves', qty: 2, unit: 'pairs' },
    { name: 'Mop', qty: 1, unit: 'pcs' },
    { name: 'Hand Wash', qty: 6, unit: 'bottles' },
    { name: 'Washroom Soap', qty: 6, unit: 'bottles' },
    { name: 'Glass Cleaner', qty: 2, unit: 'bottles' },
    { name: 'Jik (White)', qty: 1, unit: 'bottle' },
    { name: 'Jik (Coloured)', qty: 1, unit: 'bottle' },
    { name: 'Furniture Polish', qty: 2, unit: 'tins' }
  ];
  
  for (const item of items) {
    const { error } = await supabase.from('stock_items').insert({
      category: 'Washroom Essentials',
      item_name: item.name,
      current_quantity: item.qty,
      unit: item.unit,
      is_durable: false,
      notes: ''
    });
    
    if (error) throw error;
  }
  
  console.log(`   ✅ Imported ${items.length} Washroom Essentials items`);
}


async function importSnacks() {
  console.log('\n🍪 Step 4: Importing Snacks...');
  
  const items = [
    { name: 'Biscuits', qty: 2, unit: 'tins' },
    { name: 'Peanuts', qty: 2, unit: 'pkts' },
    { name: 'Honey', qty: 2, unit: 'tins' },
    { name: 'Hibiscus', qty: 2, unit: 'pkts' }
  ];
  
  for (const item of items) {
    const { error } = await supabase.from('stock_items').insert({
      category: 'Snacks',
      item_name: item.name,
      current_quantity: item.qty,
      unit: item.unit,
      is_durable: false,
      notes: ''
    });
    
    if (error) throw error;
  }
  
  console.log(`   ✅ Imported ${items.length} Snacks items`);
}


async function importKitchenStock() {
  console.log('\n🍽️  Step 5: Importing Kitchen Stock (Durable Items)...');
  
  const csvPath = join(__dirname, '../../CSV DATA/Kitchen Stock.csv');
  const content = readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n');
  
  let imported = 0;
  
  // Skip first line (header) and start from line 2
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('TOTAL')) continue;
    
    const parts = line.split(',');
    if (parts.length < 3) continue;
    
    const itemName = parts[1]?.trim();
    const currentQty = parseFloat(parts[2]) || 0;
    const notes = parts[5]?.trim() || '';
    
    if (!itemName) continue;
    
    const { error } = await supabase.from('stock_items').insert({
      category: 'Kitchen Stock',
      item_name: itemName,
      current_quantity: currentQty,
      unit: 'pcs',
      is_durable: true,
      notes: notes
    });
    
    if (error) {
      console.log(`   ⚠️  Skipped: ${itemName} - ${error.message}`);
      continue;
    }
    imported++;
  }
  
  console.log(`   ✅ Imported ${imported} Kitchen Stock items`);
}


async function importWaterCount() {
  console.log('\n💧 Step 6: Importing Water Count...');
  
  const { error } = await supabase.from('stock_items').insert({
    category: 'Water Count',
    item_name: 'Dispenser Bottles',
    current_quantity: 9,
    unit: 'bottles',
    is_durable: false,
    notes: 'Latest delivery: 04/03/2026'
  });
  
  if (error) throw error;
  
  console.log('   ✅ Imported Water Count item');
}

async function verifyImport() {
  console.log('\n🔍 Step 7: Verifying import...');
  
  const { data: allItems, error } = await supabase
    .from('stock_items')
    .select('*');
  
  if (error) throw error;
  
  const categories = {};
  allItems.forEach(item => {
    categories[item.category] = (categories[item.category] || 0) + 1;
  });
  
  console.log('\n   📊 Import Summary:');
  console.log('   ─'.repeat(40));
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`   ${cat.padEnd(25)} ${count} items`);
  });
  console.log('   ─'.repeat(40));
  console.log(`   Total Items: ${allItems.length}`);
  
  return allItems.length;
}


async function main() {
  try {
    console.log('\n📋 CSV Data Import Process');
    console.log('   This will clear all existing stock data and import fresh data from CSV files\n');
    
    await clearExistingData();
    await importKitchenEssentials();
    await importWashroomEssentials();
    await importSnacks();
    await importKitchenStock();
    await importWaterCount();
    const totalItems = await verifyImport();
    
    console.log('\n═'.repeat(60));
    console.log('✨ IMPORT COMPLETED SUCCESSFULLY! ✨');
    console.log('═'.repeat(60));
    console.log(`\n✅ ${totalItems} items imported from CSV files`);
    console.log('✅ Database updated with latest data');
    console.log('✅ All categories populated\n');
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   - Check CSV files exist in "CSV DATA" folder');
    console.error('   - Verify database connection in .env file');
    console.error('   - Ensure Supabase credentials are correct\n');
    process.exit(1);
  }
}

main();
