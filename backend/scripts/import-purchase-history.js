import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🚀 Importing Purchase History from CSV Files\n');
console.log('═'.repeat(60));

// Parse date from DD/MM/YYYY format
function parseDate(dateStr) {
  if (!dateStr || dateStr === '-') return null;
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Parse quantity (e.g., "8 kg" -> 8)
function parseQuantity(qtyStr) {
  if (!qtyStr || qtyStr === '-') return 0;
  const match = qtyStr.match(/^(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
}

async function importKitchenEssentials() {
  console.log('\n📦 Importing Kitchen Essentials Purchase History...');
  
  const csvPath = join(__dirname, '../../CSV DATA/Kitchen Essentials.csv');
  const content = readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n');
  
  // Extract dates from header row (row 3)
  const dateRow = lines[2].split(',');
  const dates = dateRow.slice(1).map(d => d.trim()).filter(d => d);
  
  let imported = 0;
  
  // Process each item (starting from row 4)
  for (let i = 3; i < lines.length && i < 11; i++) {
    const parts = lines[i].split(',');
    const itemName = parts[0]?.trim();
    
    if (!itemName) continue;
    
    // Get stock item ID
    const { data: stockItem } = await supabase
      .from('stock_items')
      .select('id')
      .eq('category', 'Kitchen Essentials')
      .eq('item_name', itemName)
      .single();
    
    if (!stockItem) {
      console.log(`   ⚠️  Item not found: ${itemName}`);
      continue;
    }
    
    // Import each purchase
    for (let j = 0; j < dates.length && j < parts.length - 1; j++) {
      const quantity = parseQuantity(parts[j + 1]);
      const purchaseDate = parseDate(dates[j]);
      
      if (quantity > 0 && purchaseDate) {
        const { error } = await supabase
          .from('purchase_history')
          .insert({
            stock_item_id: stockItem.id,
            quantity: quantity,
            unit_price: 0,
            purchase_date: purchaseDate,
            notes: ''
          });
        
        if (!error) imported++;
      }
    }
  }
  
  console.log(`   ✅ Imported ${imported} purchase records`);
}

async function importWashroomEssentials() {
  console.log('\n🚿 Importing Washroom Essentials Purchase History...');
  
  const csvPath = join(__dirname, '../../CSV DATA/Washroom Essentials.csv');
  const content = readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n');
  
  const dateRow = lines[2].split(',');
  const dates = dateRow.slice(1).map(d => d.trim()).filter(d => d);
  
  let imported = 0;
  
  for (let i = 3; i < lines.length && i < 18; i++) {
    const parts = lines[i].split(',');
    const itemName = parts[0]?.trim();
    
    if (!itemName) continue;
    
    const { data: stockItem } = await supabase
      .from('stock_items')
      .select('id')
      .eq('category', 'Washroom Essentials')
      .eq('item_name', itemName)
      .single();
    
    if (!stockItem) {
      console.log(`   ⚠️  Item not found: ${itemName}`);
      continue;
    }
    
    for (let j = 0; j < dates.length && j < parts.length - 1; j++) {
      const quantity = parseQuantity(parts[j + 1]);
      const purchaseDate = parseDate(dates[j]);
      
      if (quantity > 0 && purchaseDate) {
        const { error } = await supabase
          .from('purchase_history')
          .insert({
            stock_item_id: stockItem.id,
            quantity: quantity,
            unit_price: 0,
            purchase_date: purchaseDate,
            notes: ''
          });
        
        if (!error) imported++;
      }
    }
  }
  
  console.log(`   ✅ Imported ${imported} purchase records`);
}


async function importSnacks() {
  console.log('\n🍪 Importing Snacks Purchase History...');
  
  const csvPath = join(__dirname, '../../CSV DATA/Snacks.csv');
  const content = readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n');
  
  const dateRow = lines[2].split(',');
  const dates = dateRow.slice(1).map(d => d.trim()).filter(d => d);
  
  let imported = 0;
  
  for (let i = 3; i < lines.length && i < 7; i++) {
    const parts = lines[i].split(',');
    const itemName = parts[0]?.trim();
    
    if (!itemName) continue;
    
    const { data: stockItem } = await supabase
      .from('stock_items')
      .select('id')
      .eq('category', 'Snacks')
      .eq('item_name', itemName)
      .single();
    
    if (!stockItem) {
      console.log(`   ⚠️  Item not found: ${itemName}`);
      continue;
    }
    
    for (let j = 0; j < dates.length && j < parts.length - 1; j++) {
      const quantity = parseQuantity(parts[j + 1]);
      const purchaseDate = parseDate(dates[j]);
      
      if (quantity > 0 && purchaseDate) {
        const { error } = await supabase
          .from('purchase_history')
          .insert({
            stock_item_id: stockItem.id,
            quantity: quantity,
            unit_price: 0,
            purchase_date: purchaseDate,
            notes: ''
          });
        
        if (!error) imported++;
      }
    }
  }
  
  console.log(`   ✅ Imported ${imported} purchase records`);
}

async function clearPurchaseHistory() {
  console.log('\n🗑️  Clearing existing purchase history...');
  
  const { error } = await supabase
    .from('purchase_history')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (error) throw error;
  console.log('   ✅ Purchase history cleared');
}

async function verifyImport() {
  console.log('\n🔍 Verifying import...');
  
  const { data, error } = await supabase
    .from('purchase_history')
    .select('*');
  
  if (error) throw error;
  
  console.log(`\n   📊 Total purchase records: ${data.length}`);
}

async function main() {
  try {
    await clearPurchaseHistory();
    await importKitchenEssentials();
    await importWashroomEssentials();
    await importSnacks();
    await verifyImport();
    
    console.log('\n═'.repeat(60));
    console.log('✨ PURCHASE HISTORY IMPORT COMPLETED! ✨');
    console.log('═'.repeat(60));
    console.log();
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

main();
