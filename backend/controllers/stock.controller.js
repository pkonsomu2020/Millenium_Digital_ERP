import { supabase } from '../config/supabase.js';

// ============================================
// STOCK ITEMS
// ============================================

// Get all stock items
export const getAllStockItems = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stock_items')
      .select('*')
      .order('category', { ascending: true })
      .order('item_name', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get stock item by ID
export const getStockItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('stock_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new stock item
export const createStockItem = async (req, res) => {
  try {
    const { category, item_name, unit, is_durable, notes, current_quantity, purchased_qty, broken_lost_qty, total_qty } = req.body;

    const { data, error } = await supabase
      .from('stock_items')
      .insert([{
        category,
        item_name,
        unit,
        is_durable: is_durable || false,
        notes: notes || '',
        current_quantity: current_quantity || 0,
        purchased_qty: purchased_qty || 0,
        broken_lost_qty: broken_lost_qty || 0,
        total_qty: total_qty || 0,
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ success: false, error: `"${item_name}" already exists in ${category}.` });
      }
      throw error;
    }

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update stock item
export const updateStockItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('stock_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ success: false, error: 'An item with that name already exists in this category.' });
      }
      throw error;
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete stock item
export const deleteStockItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('stock_items').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Stock item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get stock by category
export const getStockByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { data, error } = await supabase
      .from('stock_items')
      .select('*')
      .eq('category', category)
      .order('item_name', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get stock stats
export const getStockStats = async (req, res) => {
  try {
    const { data: allItems, error } = await supabase.from('stock_items').select('*');
    if (error) throw error;

    const categories = [...new Set(allItems.map(item => item.category))];

    res.json({
      success: true,
      stats: {
        total_items: allItems.length,
        categories_count: categories.length,
        categories
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// STOCK MONTHS
// ============================================

// Get all months for a category
export const getStockMonths = async (req, res) => {
  try {
    const { category } = req.params;
    const { data, error } = await supabase
      .from('stock_months')
      .select('*')
      .eq('category', category)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create or add a new month
export const createStockMonth = async (req, res) => {
  try {
    const { category, month_key, month_label, period_1_label, period_2_label, sort_order } = req.body;

    const { data, error } = await supabase
      .from('stock_months')
      .insert([{ category, month_key, month_label, period_1_label, period_2_label, sort_order }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ success: false, error: `Month ${month_key} already exists for ${category}.` });
      }
      throw error;
    }

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add a new month template with 0 values
export const addStockMonthTemplate = async (req, res) => {
  try {
    const { category, month_key, month_label, period_1_label, period_2_label, sort_order } = req.body;

    const { data: monthRow, error: monthError } = await supabase
      .from('stock_months')
      .insert([{ category, month_key, month_label, period_1_label, period_2_label, sort_order }])
      .select()
      .single();

    if (monthError) {
      if (monthError.code === '23505') {
        return res.status(409).json({ success: false, error: `Month ${month_key} already exists for ${category}.` });
      }
      throw monthError;
    }

    const { data: items, error: itemsError } = await supabase
      .from('stock_items')
      .select('id, current_quantity')
      .eq('category', category);

    if (itemsError) throw itemsError;

    const entriesToInsert = items.map(item => ({
      stock_item_id: item.id,
      month_id: monthRow.id,
      p1_opening: 0,
      p1_bought: 0,
      p1_used: 0,
      p1_closing: 0,
      p2_opening: 0,
      p2_bought: 0,
      p2_used: 0,
      p2_closing: 0,
      total_bought: 0,
      total_used: 0,
      stock_movement: 0,
      final_closing: 0
    }));

    if (entriesToInsert.length > 0) {
      const { error: entriesError } = await supabase
        .from('stock_entries')
        .insert(entriesToInsert);
      if (entriesError) throw entriesError;
    }

    res.status(201).json({ success: true, data: monthRow });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// STOCK ENTRIES (dual-period data)
// ============================================

// Get all entries for a category (with item names and month info)
export const getCategoryEntries = async (req, res) => {
  try {
    const { category } = req.params;

    // Get items for this category
    const { data: items, error: itemsError } = await supabase
      .from('stock_items')
      .select('id, item_name, unit, is_durable, current_quantity, purchased_qty, broken_lost_qty, total_qty, notes')
      .eq('category', category)
      .order('item_name', { ascending: true });

    if (itemsError) throw itemsError;

    // Get months for this category
    const { data: months, error: monthsError } = await supabase
      .from('stock_months')
      .select('*')
      .eq('category', category)
      .order('sort_order', { ascending: true });

    if (monthsError) throw monthsError;

    // Get all entries for these items
    const itemIds = items.map(i => i.id);
    const monthIds = months.map(m => m.id);

    let entries = [];
    if (itemIds.length > 0 && monthIds.length > 0) {
      const { data: entryData, error: entriesError } = await supabase
        .from('stock_entries')
        .select('*')
        .in('stock_item_id', itemIds)
        .in('month_id', monthIds);

      if (entriesError) throw entriesError;
      entries = entryData || [];
    }

    res.json({
      success: true,
      items,
      months,
      entries,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Upsert a single stock entry
export const upsertStockEntry = async (req, res) => {
  try {
    const { stock_item_id, month_id, p1_opening, p1_bought, p1_used, p1_closing, p2_opening, p2_bought, p2_used, p2_closing, total_bought, total_used, stock_movement, final_closing } = req.body;

    const { data, error } = await supabase
      .from('stock_entries')
      .upsert({
        stock_item_id,
        month_id,
        p1_opening: p1_opening || 0,
        p1_bought: p1_bought || 0,
        p1_used: p1_used || 0,
        p1_closing: p1_closing || 0,
        p2_opening: p2_opening || 0,
        p2_bought: p2_bought || 0,
        p2_used: p2_used || 0,
        p2_closing: p2_closing || 0,
        total_bought: total_bought || 0,
        total_used: total_used || 0,
        stock_movement: stock_movement || 0,
        final_closing: final_closing || 0,
      }, { onConflict: 'stock_item_id,month_id' })
      .select()
      .single();

    if (error) throw error;

    // Update stock_items.current_quantity only when this entry is for the latest month in its category
    const { data: monthRow } = await supabase
      .from('stock_months')
      .select('category, sort_order')
      .eq('id', month_id)
      .single();

    if (monthRow?.category) {
      const { data: latestMonth } = await supabase
        .from('stock_months')
        .select('id')
        .eq('category', monthRow.category)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single();

      if (latestMonth?.id === month_id) {
        await supabase
          .from('stock_items')
          .update({ current_quantity: data.final_closing ?? final_closing ?? 0 })
          .eq('id', stock_item_id);
      }
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Batch upsert stock entries
export const batchUpsertEntries = async (req, res) => {
  try {
    const { entries } = req.body;
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ success: false, error: 'Entries array is required' });
    }

    const { data, error } = await supabase
      .from('stock_entries')
      .upsert(entries, { onConflict: 'stock_item_id,month_id' })
      .select();

    if (error) throw error;

    // Update current_quantity for all affected items
    const itemIds = [...new Set(entries.map(e => e.stock_item_id))];
    for (const itemId of itemIds) {
      // Get the latest month entry for this item
      const { data: latestEntry } = await supabase
        .from('stock_entries')
        .select('final_closing, stock_months(sort_order)')
        .eq('stock_item_id', itemId)
        .order('stock_months(sort_order)', { referencedTable: 'stock_months', ascending: false })
        .limit(1);

      if (latestEntry && latestEntry.length > 0) {
        await supabase
          .from('stock_items')
          .update({ current_quantity: latestEntry[0].final_closing })
          .eq('id', itemId);
      }
    }

    res.json({ success: true, data, count: data.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// WATER DELIVERIES
// ============================================

export const getWaterDeliveries = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('water_deliveries')
      .select('*')
      .order('delivery_date', { ascending: true });

    if (error) throw error;

    const monthMap = {};
    data.forEach(row => {
      const d = new Date(row.delivery_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-GB', { month: 'short', year: '2-digit' }).toUpperCase();
      if (!monthMap[key]) monthMap[key] = { label, deliveries: [], total: 0 };
      monthMap[key].deliveries.push(row);
      monthMap[key].total += row.bottles_delivered;
    });

    const grandTotal = data.reduce((s, r) => s + r.bottles_delivered, 0);
    const allBottles = data.map(r => r.bottles_delivered);
    const stats = {
      grand_total: grandTotal,
      total_deliveries: data.length,
      average_per_delivery: data.length ? Math.round(grandTotal / data.length) : 0,
      max_delivery: allBottles.length ? Math.max(...allBottles) : 0,
      min_delivery: allBottles.length ? Math.min(...allBottles) : 0,
    };

    res.json({ success: true, data, months: Object.values(monthMap), stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addWaterDelivery = async (req, res) => {
  try {
    const { delivery_date, bottles_delivered, notes } = req.body;
    const { data, error } = await supabase
      .from('water_deliveries')
      .insert([{ delivery_date, bottles_delivered, notes: notes || '' }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteWaterDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('water_deliveries').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Delivery deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateWaterDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { delivery_date, bottles_delivered } = req.body;
    const { data, error } = await supabase
      .from('water_deliveries')
      .update({ delivery_date, bottles_delivered })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// COMMENTS
// ============================================

export const getCategoryComments = async (req, res) => {
  try {
    const { category } = req.params;
    const { data, error } = await supabase
      .from('purchase_date_comments')
      .select('*')
      .eq('category', category);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const saveComment = async (req, res) => {
  try {
    const { category, purchase_date, comment } = req.body;
    const { data, error } = await supabase
      .from('purchase_date_comments')
      .upsert({ category, purchase_date, comment }, { onConflict: 'category,purchase_date' })
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
