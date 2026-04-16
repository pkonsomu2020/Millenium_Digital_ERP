import { supabase } from '../config/supabase.js';

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
      .select('*, purchase_history(*)')
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
    const { category, item_name, current_quantity, unit, is_durable, notes } = req.body;

    const { data, error } = await supabase
      .from('stock_items')
      .insert([{
        category,
        item_name,
        current_quantity: current_quantity || 0,
        unit,
        is_durable: is_durable || false,
        notes: notes || ''
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ success: false, error: `"${item_name}" already exists in ${category}. Use a different name or edit the existing item.` });
      }
      throw error;
    }

    // If initial quantity > 0, create a purchase history record
    if (data && current_quantity && current_quantity > 0) {
      await supabase
        .from('purchase_history')
        .insert([{
          stock_item_id: data.id,
          quantity: current_quantity,
          unit_price: 0,
          purchase_date: new Date().toISOString().split('T')[0],
          notes: 'Initial stock'
        }]);
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
        return res.status(409).json({ success: false, error: `An item with that name already exists in this category.` });
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

    const { error } = await supabase
      .from('stock_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Stock item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get low stock items
export const getLowStockItems = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stock_items')
      .select('*')
      .lte('current_quantity', supabase.raw('threshold'))
      .order('current_quantity', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data, count: data.length });
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

// Add purchase history
export const addPurchaseHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, unit_price, purchase_date, notes } = req.body;

    // Insert purchase history
    const { data: purchaseData, error: purchaseError } = await supabase
      .from('purchase_history')
      .insert([{
        stock_item_id: id,
        quantity,
        unit_price: unit_price || 0,
        purchase_date: purchase_date || new Date().toISOString(),
        notes: notes || ''
      }])
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    // Update current quantity
    const { data: stockItem, error: fetchError } = await supabase
      .from('stock_items')
      .select('current_quantity')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const newQuantity = (stockItem.current_quantity || 0) + quantity;

    const { error: updateError } = await supabase
      .from('stock_items')
      .update({ current_quantity: newQuantity })
      .eq('id', id);

    if (updateError) throw updateError;

    res.status(201).json({ success: true, data: purchaseData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get stock statistics
export const getStockStats = async (req, res) => {
  try {
    const { data: allItems, error: allError } = await supabase
      .from('stock_items')
      .select('*');

    if (allError) throw allError;

    const categories = [...new Set(allItems.map(item => item.category))];

    res.json({
      success: true,
      stats: {
        total_items: allItems.length,
        categories_count: categories.length,
        categories: categories
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get purchase history for a specific item
export const getPurchaseHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('purchase_history')
      .select('*')
      .eq('stock_item_id', id)
      .order('purchase_date', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update a purchase history record
export const updatePurchaseHistory = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const { quantity, notes, purchase_date } = req.body;

    // Get the old record first
    const { data: oldRecord, error: fetchError } = await supabase
      .from('purchase_history')
      .select('*')
      .eq('id', purchaseId)
      .single();

    if (fetchError) throw fetchError;

    // Update the purchase history record
    const updateFields = {
      quantity: quantity !== undefined ? quantity : oldRecord.quantity,
      notes: notes !== undefined ? notes : oldRecord.notes,
    };
    if (purchase_date !== undefined) updateFields.purchase_date = purchase_date;

    const { data, error } = await supabase
      .from('purchase_history')
      .update(updateFields)
      .eq('id', purchaseId)
      .select()
      .single();

    if (error) throw error;

    // Adjust current_quantity on the stock item by the difference
    const diff = quantity - oldRecord.quantity;
    if (diff !== 0) {
      const { data: stockItem, error: stockFetchError } = await supabase
        .from('stock_items')
        .select('current_quantity')
        .eq('id', oldRecord.stock_item_id)
        .single();

      if (stockFetchError) throw stockFetchError;

      await supabase
        .from('stock_items')
        .update({ current_quantity: (stockItem.current_quantity || 0) + diff })
        .eq('id', oldRecord.stock_item_id);
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a purchase history record
export const deletePurchaseHistory = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    // Get the record first to adjust stock quantity
    const { data: record, error: fetchError } = await supabase
      .from('purchase_history')
      .select('*')
      .eq('id', purchaseId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('purchase_history')
      .delete()
      .eq('id', purchaseId);

    if (error) throw error;

    // Subtract the deleted quantity from current stock
    const { data: stockItem, error: stockFetchError } = await supabase
      .from('stock_items')
      .select('current_quantity')
      .eq('id', record.stock_item_id)
      .single();

    if (!stockFetchError) {
      const newQty = Math.max(0, (stockItem.current_quantity || 0) - record.quantity);
      await supabase
        .from('stock_items')
        .update({ current_quantity: newQty })
        .eq('id', record.stock_item_id);
    }

    res.json({ success: true, message: 'Purchase record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all water deliveries (full log)
export const getWaterDeliveries = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('water_deliveries')
      .select('*')
      .order('delivery_date', { ascending: true });

    if (error) throw error;

    // Group by month and compute monthly totals
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

// Add a water delivery
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

// Delete a water delivery
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

// Get monthly purchase summary for a category (Excel-style grouped view)
export const getMonthlyCategoryPurchases = async (req, res) => {
  try {
    const { category } = req.params;

    const { data: items, error: itemsError } = await supabase
      .from('stock_items')
      .select('id, item_name, unit, current_quantity, purchased_qty, total_qty, notes, is_durable')
      .eq('category', category)
      .order('item_name', { ascending: true });

    if (itemsError) throw itemsError;

    const { data: history, error: histError } = await supabase
      .from('purchase_history')
      .select('*')
      .in('stock_item_id', items.map(i => i.id))
      .order('purchase_date', { ascending: true });

    if (histError) throw histError;

    // Group purchase history by month
    const monthMap = {};
    history.forEach(row => {
      const d = new Date(row.purchase_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-GB', { month: 'short', year: '2-digit' }).toUpperCase();
      if (!monthMap[key]) monthMap[key] = { key, label, dates: {}, totals: {}, trends: {} };
      const dateStr = row.purchase_date;
      if (!monthMap[key].dates[dateStr]) monthMap[key].dates[dateStr] = {};
      monthMap[key].dates[dateStr][row.stock_item_id] = row.quantity;
      monthMap[key].totals[row.stock_item_id] = (monthMap[key].totals[row.stock_item_id] || 0) + row.quantity;
    });

    // Compute trends (current month total vs previous month total)
    const monthKeys = Object.keys(monthMap).sort();
    monthKeys.forEach((key, idx) => {
      if (idx === 0) return;
      const prev = monthMap[monthKeys[idx - 1]];
      items.forEach(item => {
        const curr = monthMap[key].totals[item.id] || 0;
        const prevVal = prev.totals[item.id] || 0;
        monthMap[key].trends[item.id] = curr - prevVal;
      });
    });

    res.json({
      success: true,
      items,
      months: monthKeys.map(k => monthMap[k]),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
