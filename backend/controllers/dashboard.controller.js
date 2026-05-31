import { supabase } from '../config/supabase.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [stockRes, leaveRes, meetingsRes, entriesRes] = await Promise.all([
      supabase.from('stock_items').select('id, category, item_name, current_quantity, is_durable'),
      supabase.from('leave_requests').select('status, leave_type, submitted_on'),
      supabase.from('meetings').select('status, meeting_date'),
      supabase
        .from('stock_entries')
        .select('total_bought, stock_months(month_label, month_key, sort_order)'),
    ]);

    if (stockRes.error) throw stockRes.error;
    if (leaveRes.error) throw leaveRes.error;
    if (meetingsRes.error) throw meetingsRes.error;
    if (entriesRes.error) throw entriesRes.error;

    const stock = stockRes.data || [];
    const leaves = leaveRes.data || [];
    const meetings = meetingsRes.data || [];
    const monthlyEntries = entriesRes.data || [];

    const qty = (v) => {
      const n = Number(v);
      return Number.isNaN(n) ? 0 : n;
    };

    // --- Stock stats ---
    const lowStockItems = stock
      .filter((i) => !i.is_durable && qty(i.current_quantity) <= 3)
      .sort((a, b) => qty(a.current_quantity) - qty(b.current_quantity));

    const categoryMap = {};
    stock.forEach((item) => {
      categoryMap[item.category] = (categoryMap[item.category] || 0) + 1;
    });
    const stockByCategory = Object.entries(categoryMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // --- Monthly purchase trend (aggregate in JS — Supabase cannot order by embedded resource) ---
    const monthAgg = {};
    monthlyEntries.forEach((e) => {
      const m = e.stock_months;
      if (!m) return;
      const key = m.month_key || m.month_label;
      if (!monthAgg[key]) {
        monthAgg[key] = {
          month: m.month_label || key,
          quantity: 0,
          sort_order: m.sort_order ?? 0,
        };
      }
      monthAgg[key].quantity += qty(e.total_bought);
    });
    const purchasesMonthly = Object.values(monthAgg)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(({ month, quantity }) => ({ month, quantity }))
      .slice(-8);

    const totalPurchased = monthlyEntries.reduce((s, e) => s + qty(e.total_bought), 0);

    // --- Recent stock activity ---
    const { data: recentEntries, error: recentErr } = await supabase
      .from('stock_entries')
      .select(
        'total_bought, updated_at, stock_items(item_name, category), stock_months(month_label)'
      )
      .order('updated_at', { ascending: false })
      .limit(40);

    if (recentErr) throw recentErr;

    const recentPurchases = (recentEntries || [])
      .filter((e) => qty(e.total_bought) > 0)
      .slice(0, 10)
      .map((e) => ({
        date: e.updated_at || new Date().toISOString(),
        item: e.stock_items?.item_name || 'Unknown',
        category: e.stock_items?.category || '',
        quantity: qty(e.total_bought),
        month: e.stock_months?.month_label || '',
      }));

    // --- Leave stats ---
    const leaveStats = {
      pending: leaves.filter((l) => l.status === 'Pending').length,
      approved: leaves.filter((l) => l.status === 'Approved').length,
      rejected: leaves.filter((l) => l.status === 'Rejected').length,
      deferred: leaves.filter((l) => l.status === 'Deferred').length,
      total: leaves.length,
    };

    const leaveTypeMap = {};
    leaves.forEach((l) => {
      const t = l.leave_type || 'Other';
      leaveTypeMap[t] = (leaveTypeMap[t] || 0) + 1;
    });
    const leaveByType = Object.entries(leaveTypeMap)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // --- Meetings stats ---
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const meetingStats = {
      upcoming: meetings.filter((m) => m.status === 'Upcoming').length,
      completed: meetings.filter((m) => m.status === 'Completed').length,
      thisWeek: meetings.filter((m) => {
        const d = new Date(m.meeting_date);
        return d >= weekStart && d <= weekEnd;
      }).length,
      total: meetings.length,
    };

    const meetingMonthMap = {};
    meetings.forEach((m) => {
      const d = new Date(m.meeting_date);
      if (Number.isNaN(d.getTime())) return;
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-GB', { month: 'short', year: '2-digit' });
      if (!meetingMonthMap[sortKey]) {
        meetingMonthMap[sortKey] = { month: label, count: 0, sortKey };
      }
      meetingMonthMap[sortKey].count += 1;
    });
    const meetingsPerMonth = Object.values(meetingMonthMap)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(({ month, count }) => ({ month, count }))
      .slice(-6);

    res.json({
      success: true,
      stock: {
        total: stock.length,
        lowStock: lowStockItems.length,
        byCategory: stockByCategory,
        lowStockItems: lowStockItems.slice(0, 8).map((i) => ({
          ...i,
          current_quantity: qty(i.current_quantity),
        })),
      },
      purchases: {
        monthly: purchasesMonthly,
        recent: recentPurchases,
        totalPurchased,
      },
      leave: { stats: leaveStats, byType: leaveByType },
      meetings: { stats: meetingStats, perMonth: meetingsPerMonth },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
