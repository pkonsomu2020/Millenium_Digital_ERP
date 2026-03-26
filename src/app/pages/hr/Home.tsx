import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Clock, Calendar, Package, TrendingUp, CheckCircle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { api } from "../../../services/api";

const CATEGORY_COLORS = ["#D1131B", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];
const LEAVE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg px-4 py-3 text-sm">
        <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export function HRHome() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(true), 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#D1131B] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const s = stats || {};
  const stock = s.stock || {};
  const purchases = s.purchases || {};
  const leave = s.leave || {};
  const meetings = s.meetings || {};

  const metricCards = [
    { title: "Stock Items", value: stock.total ?? 0, sub: `${stock.lowStock ?? 0} low stock alerts`, icon: Package, gradient: "from-[#D1131B] to-[#ff4d4d]", alert: (stock.lowStock ?? 0) > 0 },
    { title: "Pending Leave", value: leave.stats?.pending ?? 0, sub: `${leave.stats?.total ?? 0} total requests`, icon: Clock, gradient: "from-blue-500 to-blue-400" },
    { title: "Upcoming Meetings", value: meetings.stats?.upcoming ?? 0, sub: `${meetings.stats?.thisWeek ?? 0} this week`, icon: Calendar, gradient: "from-emerald-500 to-emerald-400" },
    { title: "Total Purchases", value: (purchases.monthly || []).reduce((s: number, m: any) => s + m.quantity, 0), sub: "Units across 6 months", icon: TrendingUp, gradient: "from-purple-500 to-purple-400" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Overview</h2>
          {lastUpdated && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Last updated: {lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.title} className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 dark:bg-gray-800 dark:border-gray-700 group">
              <div className={`bg-gradient-to-r ${m.gradient} p-4 flex items-center justify-between`}>
                <div>
                  <p className="text-white/80 text-xs font-medium uppercase tracking-wider">{m.title}</p>
                  <p className="text-white text-3xl font-bold mt-1">{m.value}</p>
                </div>
                <div className="bg-white/20 rounded-xl p-3 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardContent className="pt-3 pb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  {(m as any).alert && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                  {m.sub}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-[#374151] dark:text-white">Leave Status</CardTitle>
            <p className="text-xs text-gray-500 dark:text-gray-400">Breakdown of all requests</p>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{ name: "Pending", value: leave.stats?.pending || 0 }, { name: "Approved", value: leave.stats?.approved || 0 }, { name: "Rejected", value: leave.stats?.rejected || 0 }]} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    <Cell fill="#F59E0B" /><Cell fill="#10B981" /><Cell fill="#EF4444" />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600 dark:text-gray-300">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[{ label: "Pending", val: leave.stats?.pending ?? 0, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" }, { label: "Approved", val: leave.stats?.approved ?? 0, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" }, { label: "Rejected", val: leave.stats?.rejected ?? 0, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" }].map(item => (
                <div key={item.label} className={`${item.bg} rounded-lg p-2 text-center`}>
                  <p className={`text-xl font-bold ${item.color}`}>{item.val}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-[#374151] dark:text-white">Stock by Category</CardTitle>
            <p className="text-xs text-gray-500 dark:text-gray-400">Number of items per category</p>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stock.byCategory || []} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
                  <defs>{(stock.byCategory || []).map((_: any, i: number) => (<linearGradient key={i} id={`hrbar${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} stopOpacity={1} /><stop offset="100%" stopColor={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} stopOpacity={0.6} /></linearGradient>))}</defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} angle={-35} textAnchor="end" dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Items" radius={[6, 6, 0, 0]} maxBarSize={48}>{(stock.byCategory || []).map((_: any, i: number) => (<Cell key={i} fill={`url(#hrbar${i})`} />))}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-base text-[#374151] dark:text-white">Purchase Trend</CardTitle><p className="text-xs text-gray-500 dark:text-gray-400">Total units purchased per month</p></CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={purchases.monthly || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs><linearGradient id="hrPurchaseGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D1131B" stopOpacity={0.25} /><stop offset="95%" stopColor="#D1131B" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="quantity" name="Units" stroke="#D1131B" strokeWidth={2.5} fill="url(#hrPurchaseGrad)" dot={{ fill: '#D1131B', r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-base text-[#374151] dark:text-white">Meetings per Month</CardTitle><p className="text-xs text-gray-500 dark:text-gray-400">Scheduled meetings over the last 6 months</p></CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={meetings.perMonth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="count" name="Meetings" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2"><CardTitle className="text-base text-[#374151] dark:text-white">Leave by Type</CardTitle><p className="text-xs text-gray-500 dark:text-gray-400">Distribution of leave request types</p></CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leave.byType || []} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="type" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Requests" radius={[0, 6, 6, 0]} maxBarSize={22}>{(leave.byType || []).map((_: any, i: number) => (<Cell key={i} fill={LEAVE_COLORS[i % LEAVE_COLORS.length]} />))}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div><CardTitle className="text-base text-[#374151] dark:text-white">Low Stock Alerts</CardTitle><p className="text-xs text-gray-500 dark:text-gray-400">Items with 3 or fewer units</p></div>
            {(stock.lowStock ?? 0) > 0 && <Badge className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-none">{stock.lowStock} alerts</Badge>}
          </CardHeader>
          <CardContent className="p-0">
            {(stock.lowStockItems || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <CheckCircle className="w-10 h-10 text-emerald-400 mb-2" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">All stocked up</p>
                <p className="text-xs text-gray-400 mt-1">No items are running low</p>
              </div>
            ) : (
              <Table>
                <TableHeader><TableRow className="bg-gray-50 dark:bg-gray-700/50"><TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-300">Item</TableHead><TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-300">Category</TableHead><TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-300 text-right">Qty</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(stock.lowStockItems || []).map((item: any, i: number) => (
                    <TableRow key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <TableCell className="text-xs font-medium text-gray-900 dark:text-white py-2">{item.item_name}</TableCell>
                      <TableCell className="text-xs text-gray-500 dark:text-gray-400 py-2">{item.category}</TableCell>
                      <TableCell className="text-right py-2"><Badge className={`text-xs ${item.current_quantity === 0 ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"} border-none`}>{item.current_quantity}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-600 pb-3">
          <CardTitle className="text-base text-[#374151] dark:text-white">Recent Purchases</CardTitle>
          <p className="text-xs text-gray-500 dark:text-gray-400">Latest stock additions across all categories</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow className="bg-gray-50 dark:bg-gray-700/50"><TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-300">Date</TableHead><TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-300">Item</TableHead><TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-300 hidden sm:table-cell">Category</TableHead><TableHead className="text-xs font-semibold text-gray-600 dark:text-gray-300 text-right">Qty</TableHead></TableRow></TableHeader>
              <TableBody>
                {(purchases.recent || []).length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-gray-400 py-8 text-sm">No purchases recorded yet</TableCell></TableRow>
                ) : (purchases.recent || []).map((p: any, i: number) => (
                  <TableRow key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <TableCell className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap py-3">{new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</TableCell>
                    <TableCell className="text-xs font-medium text-gray-900 dark:text-white py-3">{p.item}</TableCell>
                    <TableCell className="text-xs text-gray-500 dark:text-gray-400 hidden sm:table-cell py-3"><Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-none">{p.category}</Badge></TableCell>
                    <TableCell className="text-right text-xs font-semibold text-gray-800 dark:text-white py-3">{p.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
