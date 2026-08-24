import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { api } from "../../services/api";
import { StatCards, CategoryOverviewBlock } from "../components/stock/StockRegisterUI";

const CATS = ["Kitchen Essentials", "Washroom Essentials", "Water Count", "Kitchen Stock"];

const CAT_META: Record<string, { emoji: string }> = {
  "Kitchen Essentials": { emoji: "🍳" },
  "Washroom Essentials": { emoji: "🧹" },
  "Water Count": { emoji: "💧" },
  "Kitchen Stock": { emoji: "🍽" },
};

export function StockManagement() {
  const nav = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getAllStock().then((s) => setItems(s.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((i) => !q || i.item_name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
  }, [items, search]);

  const stats = useMemo(() => {
    const low = items.filter((i) => !i.is_durable && (i.current_quantity ?? 0) <= 3).length;
    const units = items.reduce((s, i) => s + (i.current_quantity || 0), 0);
    const cats = new Set(items.map((i) => i.category)).size;
    return { total: items.length, low, units, cats };
  }, [items]);

  const grouped = useMemo(() => {
    const acc: Record<string, any[]> = {};
    CATS.forEach((cat) => {
      const list = filtered.filter((i) => i.category === cat);
      if (list.length) acc[cat] = list;
    });
    return acc;
  }, [filtered]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Stock <span className="text-[#E76F51]">Overview</span>
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">
          Stock Management Register · Read-only
        </p>
      </div>

      <StatCards
        cards={[
          { label: "Total Items", value: stats.total, sub: `across ${stats.cats} categories`, variant: "red" },
          { label: "Low Stock Alerts", value: stats.low, sub: "need restocking", variant: "amber" },
          { label: "Total Units", value: stats.units, sub: "current inventory", variant: "green" },
          { label: "Categories", value: stats.cats, sub: "active groups", variant: "blue" },
        ]}
      />

      <input
        type="text"
        placeholder="Search items or categories…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E76F51]/40 focus:border-[#E76F51]"
      />

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, list]) => {
            const meta = CAT_META[cat] || { emoji: "📦" };
            const total = list.reduce((s, i) => s + (i.current_quantity || 0), 0);
            return (
              <CategoryOverviewBlock
                key={cat}
                title={cat}
                emoji={meta.emoji}
                count={list.length}
                totalUnits={total}
                items={list}
                onViewDetails={() => nav(`/stock-management/${encodeURIComponent(cat)}`)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
