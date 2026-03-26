import { supabase } from '../config/supabase.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Run all queries in parallel
    const [stockRes, purchaseRes, leaveRes, meetingsRes] = await Promise.all([
      supabase.from('stock_items').select('id, category, item_name, current_quantity'),
      supabase.from('purchase_history').select('stock_item_id, quantity, purchase_date, stock_items(item_name, category)'),
      supabase.from('leave_requests').select('status, leave_type, submitted_on'),
      supabase.from('meetings').select('status, meeting_date'),
    ]);

    const stock = stockRes.data || [];
    const purchases = purchaseRes.data || [];
    const leaves = leaveRes.data || [];
    const meetings = meetingsRes.data || [];

    // --- Stock stats ---
    const lowStockItems = stock.filter(i => i.current_quantity <= 3);

    // Stock by category (bar chart)
    const categoryMap = {};
    stock.forEach(item => {
      if (!categoryMap[item.category]) categoryMap[item.category] = 0;
      categoryMap[item.category]++;
    });
    const stockByCategory = Object.entries(categoryMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // --- Purchase history: monthly spend trend (last 6 months) ---
    const now = new Date();
    const monthlySpend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const total = purchases
        .filter(p => p.purchase_date && p.purchase_date.startsWith(monthKey))
        .reduce((sum, p) => sum + (p.quantity || 0), 0);
      monthlySpend.push({ month: label, quantity: total });
    }

    // Recent purchases (last 8)
    const recentPurchases = [...purchases]
      .filter(p => p.purchase_date)
      .sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date))
      .slice(0, 8)
      .map(p => ({
        date: p.purchase_date,
        item: p.stock_items?.item_name || 'Unknown',
        category: p.stock_items?.category || '',
        quantity: p.quantity,
      }));

    // --- Leave stats ---
    const leaveStats = {
      pending: leaves.filter(l => l.status === 'Pending').length,
      approved: leaves.filter(l => l.status === 'Approved').length,
      rejected: leaves.filter(l => l.status === 'Rejected').length,
      total: leaves.length,
    };

    // Leave by type (donut/bar)
    const leaveTypeMap = {};
    leaves.forEach(l => {
      const t = l.leave_type || 'Other';
      leaveTypeMap[t] = (leaveTypeMap[t] || 0) + 1;
    });
    const leaveByType = Object.entries(leaveTypeMap)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // --- Meetings stats ---
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);

    const meetingStats = {
      upcoming: meetings.filter(m => m.status === 'Upcoming').length,
      completed: meetings.filter(m => m.status === 'Completed').length,
      thisWeek: meetings.filter(m => {
        const d = new Date(m.meeting_date);
        return d >= weekStart && d <= weekEnd;
      }).length,
      total: meetings.length,
    };

    // Meetings per month (last 6)
    const meetingsPerMonth = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const count = meetings.filter(m => m.meeting_date && m.meeting_date.startsWith(monthKey)).length;
      meetingsPerMonth.push({ month: label, count });
    }

    res.json({
      stock: {
        total: stock.length,
        lowStock: lowStockItems.length,
        byCategory: stockByCategory,
        lowStockItems: lowStockItems.slice(0, 5),
      },
      purchases: { monthly: monthlySpend, recent: recentPurchases },
      leave: { stats: leaveStats, byType: leaveByType },
      meetings: { stats: meetingStats, perMonth: meetingsPerMonth },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
