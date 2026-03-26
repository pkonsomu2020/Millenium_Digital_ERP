import { supabase } from '../config/supabase.js';

console.log('🌱 Seeding stock data from Excel file...\n');

const stockData = [
  // Kitchen Essentials
  { category: 'Kitchen Essentials', item_name: 'Sugar', current_quantity: 8, unit: 'kg', threshold: 8, is_durable: false },
  { category: 'Kitchen Essentials', item_name: 'Milk', current_quantity: 9, unit: 'boxes', threshold: 8, is_durable: false },
  { category: 'Kitchen Essentials', item_name: 'Drinking Chocolate', current_quantity: 1, unit: 'tin', threshold: 2, is_durable: false },
  { category: 'Kitchen Essentials', item_name: 'Coffee', current_quantity: 1, unit: 'tin', threshold: 2, is_durable: false },
  { category: 'Kitchen Essentials', item_name: 'Tea leaves', current_quantity: 2, unit: 'bags', threshold: 3, is_durable: false },
  { category: 'Kitchen Essentials', item_name: 'Matchbox', current_quantity: 1, unit: 'pkt', threshold: 2, is_durable: false },
  { category: 'Kitchen Essentials', item_name: 'Super Brite', current_quantity: 2, unit: 'pcs', threshold: 3, is_durable: false },
  { category: 'Kitchen Essentials', item_name: 'Batteries', current_quantity: 2, unit: 'pairs', threshold: 3, is_durable: false },

  // Washroom Essentials
  { category: 'Washroom Essentials', item_name: 'Tissue', current_quantity: 5, unit: 'pkts', threshold: 6, is_durable: false },
  { category: 'Washroom Essentials', item_name: 'Serviettes', current_quantity: 8, unit: 'pkts', threshold: 8, is_durable: false },
  { category: 'Washroom Essentials', item_name: 'Hand Towels', current_quantity: 6, unit: 'pkts', threshold: 6, is_durable: false },
  { category: 'Washroom Essentials', item_name: 'Toilet Balls', current_quantity: 2, unit: 'pkts', threshold: 3, is_durable: false },
  { category: 'Washroom Essentials', item_name: 'Liquid Washing Soap', current_quantity: 5, unit: 'litres', threshold: 5, is_durable: false },
  { category: 'Washroom Essentials', item_name: 'Gloves', current_quantity: 2, unit: 'pairs', threshold: 3, is_durable: false },
  { category: 'Washroom Essentials', item_name: 'Mop', current_quantity: 1, unit: 'pcs', threshold: 2, is_durable: false },
  { category: 'Washroom Essentials', item_name: 'Hand Wash', current_quantity: 6, unit: 'bottles', threshold: 6, is_durable: false },
  { category: 'Washroom Essentials', item_name: 'Washroom Soap', current_quantity: 3, unit: 'bars', threshold: 5, is_durable: false },
  { category: 'Washroom Essentials', item_name: 'Glass Cleaner', current_quantity: 2, unit: 'bottles', threshold: 3, is_durable: false },
  { category: 'Washroom Essentials', item_name: 'Jik (White)', current_quantity: 1, unit: 'bottle', threshold: 2, is_durable: false },
  { category: 'Washroom Essentials', item_name: 'Jik (Coloured)', current_quantity: 1, unit: 'bottle', threshold: 2, is_durable: false },
  { category: 'Washroom Essentials', item_name: 'Furniture Polish', current_quantity: 1, unit: 'bottle', threshold: 2, is_durable: false },
  { category: 'Washroom Essentials', item_name: 'Washing Powder', current_quantity: 2, unit: 'pkts', threshold: 3, is_durable: false },
  { category: 'Washroom Essentials', item_name: 'Sufuria', current_quantity: 1, unit: 'pcs', threshold: 2, is_durable: false },

  // Snacks
  { category: 'Snacks', item_name: 'Biscuits', current_quantity: 2, unit: 'tins', threshold: 3, is_durable: false },
  { category: 'Snacks', item_name: 'Peanuts', current_quantity: 2, unit: 'pkts', threshold: 3, is_durable: false },
  { category: 'Snacks', item_name: 'Honey', current_quantity: 2, unit: 'tins', threshold: 2, is_durable: false },
  { category: 'Snacks', item_name: 'Hibiscus', current_quantity: 2, unit: 'pkts', threshold: 2, is_durable: false },

  // Kitchen Stock (Durable)
  { category: 'Kitchen Stock', item_name: 'Plates', current_quantity: 6, unit: 'pcs', threshold: 5, is_durable: true, notes: 'SIGNVRSE' },
  { category: 'Kitchen Stock', item_name: 'Side Plates', current_quantity: 8, unit: 'pcs', threshold: 5, is_durable: true, notes: 'AFOSI' },
  { category: 'Kitchen Stock', item_name: 'Spoons', current_quantity: 13, unit: 'pcs', threshold: 10, is_durable: true, notes: 'AFOSI' },
  { category: 'Kitchen Stock', item_name: 'Tea Spoons', current_quantity: 4, unit: 'pcs', threshold: 5, is_durable: true, notes: 'MILLENIUM' },
  { category: 'Kitchen Stock', item_name: 'Forks', current_quantity: 5, unit: 'pcs', threshold: 10, is_durable: true, notes: 'AFOSI' },
  { category: 'Kitchen Stock', item_name: 'Glasses', current_quantity: 22, unit: 'pcs', threshold: 15, is_durable: true, notes: 'MILLENIUM' },
  { category: 'Kitchen Stock', item_name: 'Cups', current_quantity: 18, unit: 'pcs', threshold: 15, is_durable: true, notes: 'MILLENIUM' },
  { category: 'Kitchen Stock', item_name: 'Thermos', current_quantity: 10, unit: 'pcs', threshold: 5, is_durable: true },
  { category: 'Kitchen Stock', item_name: 'Glass Jugs', current_quantity: 5, unit: 'pcs', threshold: 3, is_durable: true },
  { category: 'Kitchen Stock', item_name: 'Plastic Jugs', current_quantity: 3, unit: 'pcs', threshold: 3, is_durable: true },
  { category: 'Kitchen Stock', item_name: 'Serving Trays', current_quantity: 6, unit: 'pcs', threshold: 4, is_durable: true },
  { category: 'Kitchen Stock', item_name: 'Tumblers', current_quantity: 13, unit: 'pcs', threshold: 10, is_durable: true },
  { category: 'Kitchen Stock', item_name: 'Sufurias (Pots)', current_quantity: 3, unit: 'pcs', threshold: 2, is_durable: true },
  { category: 'Kitchen Stock', item_name: 'Buckets', current_quantity: 5, unit: 'pcs', threshold: 3, is_durable: true },
  { category: 'Kitchen Stock', item_name: 'Dustbins', current_quantity: 16, unit: 'pcs', threshold: 10, is_durable: true },
  { category: 'Kitchen Stock', item_name: 'Salt Shakers', current_quantity: 3, unit: 'pcs', threshold: 2, is_durable: true },
  { category: 'Kitchen Stock', item_name: 'Kitchen Towels', current_quantity: 6, unit: 'pkts', threshold: 5, is_durable: true },
  { category: 'Kitchen Stock', item_name: 'Pegs', current_quantity: 10, unit: 'pcs', threshold: 8, is_durable: true },
  { category: 'Kitchen Stock', item_name: 'Cloth Line', current_quantity: 1, unit: 'pcs', threshold: 1, is_durable: true },
  { category: 'Kitchen Stock', item_name: 'Scrubbing Brush', current_quantity: 1, unit: 'pcs', threshold: 2, is_durable: true },

  // Water Count
  { category: 'Water Count', item_name: 'Dispenser Bottles', current_quantity: 7, unit: 'bottles', threshold: 10, is_durable: false }
];

async function seedData() {
  try {
    console.log('Clearing existing stock items...');
    const { error: deleteError } = await supabase
      .from('stock_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error('Warning: Could not clear existing data:', deleteError.message);
    }

    console.log('Inserting stock items...');
    const { data, error } = await supabase
      .from('stock_items')
      .insert(stockData)
      .select();

    if (error) throw error;

    console.log(`✅ Successfully seeded ${data.length} stock items!`);
    console.log('\nBreakdown:');
    console.log('  - Kitchen Essentials: 8 items');
    console.log('  - Washroom Essentials: 15 items');
    console.log('  - Snacks: 4 items');
    console.log('  - Kitchen Stock (Durable): 20 items');
    console.log('  - Water Count: 1 item');
    console.log('  ─────────────────────');
    console.log('  Total: 47 items\n');

    // Add sample water deliveries
    console.log('Adding water delivery history...');
    const waterDeliveries = [
      { delivery_date: '2026-02-11', bottles_delivered: 6 },
      { delivery_date: '2026-02-13', bottles_delivered: 2 },
      { delivery_date: '2026-02-17', bottles_delivered: 11 },
      { delivery_date: '2026-02-25', bottles_delivered: 8 },
      { delivery_date: '2026-03-04', bottles_delivered: 9 },
      { delivery_date: '2026-03-10', bottles_delivered: 7, notes: 'Latest delivery' }
    ];

    const { data: waterData, error: waterError } = await supabase
      .from('water_deliveries')
      .insert(waterDeliveries)
      .select();

    if (waterError) {
      console.error('Warning: Could not add water deliveries:', waterError.message);
    } else {
      console.log(`✅ Added ${waterData.length} water delivery records\n`);
    }

    console.log('🎉 Database seeding complete!');
    
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seedData();
