import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Search, Plus } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "sonner";
import { StatCards, CategoryOverviewBlock } from "../components/stock/StockRegisterUI";

const CATS = [
  "Kitchen Essentials",
  "Washroom Essentials",
  "Water Count",
  "Kitchen Stock",
];

const CAT_META: Record<string, { emoji: string; hasDetail: boolean }> = {
  "Kitchen Essentials": { emoji: "🍳", hasDetail: true },
  "Washroom Essentials": { emoji: "🧹", hasDetail: true },
  "Water Count": { emoji: "💧", hasDetail: true },
  "Kitchen Stock": { emoji: "🍽", hasDetail: true },
};

function AddCategoryModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [catName, setCatName] = useState("");
  const [items, setItems] = useState([{ name: "", unit: "" }]);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!catName.trim()) {
      toast.error("Enter category name");
      return;
    }
    const valid = items.filter((i) => i.name.trim() && i.unit.trim());
    if (!valid.length) {
      toast.error("Add at least one item");
      return;
    }
    setSaving(true);
    try {
      await Promise.all(
        valid.map((item) =>
          api.createStockItem({
            category: catName.trim(),
            item_name: item.name.trim(),
            current_quantity: 0,
            unit: item.unit.trim(),
            is_durable: false,
            notes: "",
          })
        )
      );
      toast.success(`Category "${catName}" created`);
      onSave();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-lg p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">Add New Category</h2>
        <input
          placeholder="Category name"
          value={catName}
          onChange={(e) => setCatName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
        />
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              placeholder="Item name"
              value={item.name}
              onChange={(e) =>
                setItems((p) => p.map((r, idx) => (idx === i ? { ...r, name: e.target.value } : r)))
              }
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-xs dark:bg-gray-700 dark:text-white"
            />
            <input
              placeholder="Unit"
              value={item.unit}
              onChange={(e) =>
                setItems((p) => p.map((r, idx) => (idx === i ? { ...r, unit: e.target.value } : r)))
              }
              className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-xs dark:bg-gray-700 dark:text-white"
            />
          </div>
        ))}
        <button type="button" onClick={() => setItems((p) => [...p, { name: "", unit: "" }])} className="text-xs text-[#E76F51] font-medium">
          + Add item row
        </button>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs rounded-lg border dark:border-white/15">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={saving} className="px-3 py-1.5 text-xs rounded-lg bg-[#E76F51] text-white font-medium">
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StockManagement({ hrMode = false }: { hrMode?: boolean }) {
  const nav = useNavigate();
  const listPath = hrMode ? "/hr/dashboard/stock-management" : "/dashboard/stock-management";
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const s = await api.getAllStock();
      setItems(s.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        !q ||
        i.item_name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
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
    filtered.forEach((i) => {
      if (!CATS.includes(i.category) && !acc[i.category]) acc[i.category] = filtered.filter((x) => x.category === i.category);
    });
    return acc;
  }, [filtered]);

  return (
    <div className="p-3 sm:p-6 lg:px-8 lg:pb-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
            Stock <span className="text-[#E76F51]">Overview</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">
            Stock Management Register · 2025 – 2026
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddCat(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#E76F51] hover:bg-[#D0593B] text-white text-xs font-semibold uppercase tracking-wide"
        >
          <Plus className="w-3.5 h-3.5" /> Add Category
        </button>
      </div>

      <StatCards
        cards={[
          { label: "Total Items", value: stats.total, sub: `across ${stats.cats} categories`, variant: "red" },
          { label: "Low Stock Alerts", value: stats.low, sub: "need restocking", variant: "amber" },
          { label: "Total Units", value: stats.units, sub: "current inventory", variant: "green" },
          { label: "Categories", value: stats.cats, sub: "active groups", variant: "blue" },
        ]}
      />

      <div className="px-0">
        <input
          type="text"
          placeholder="Search items or categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E76F51]/40 focus:border-[#E76F51]"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-gray-400">No items found</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, list]) => {
            const meta = CAT_META[cat] || { emoji: "📦", hasDetail: true };
            const total = list.reduce((s, i) => s + (i.current_quantity || 0), 0);
            return (
              <CategoryOverviewBlock
                key={cat}
                title={cat}
                emoji={meta.emoji}
                count={list.length}
                totalUnits={total}
                items={list}
                showViewButton={meta.hasDetail}
                onViewDetails={() => nav(`${listPath}/${encodeURIComponent(cat)}`)}
              />
            );
          })}
        </div>
      )}

      {showAddCat && <AddCategoryModal onClose={() => setShowAddCat(false)} onSave={() => { setShowAddCat(false); load(); }} />}
    </div>
  );
}
