import { useState, useEffect } from "react";
import { Search, ExternalLink, Coffee, Droplets, ShoppingBag, Utensils, Apple, Package,
  Battery, Flame, Leaf, Box, Trash2, Wind, Shirt, SprayCan,
  FlaskConical, Milk, Cookie, Sandwich, Salad, Fish, Beef, Wheat, Egg,
  Waves, Thermometer, Wrench, Lightbulb, Printer, Monitor, Phone, Wifi } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { api } from "../../services/api";
import { useNavigate } from "react-router";

const CATEGORY_ORDER = [
  "Kitchen Essentials",
  "Washroom Essentials",
  "Water Count",
  "Kitchen Stock",
  "Snacks",
  "Other Purchases",
];

interface StockItem {
  id: string;
  category: string;
  item_name: string;
  current_quantity: number;
  unit: string;
  notes: string;
}

// Map keywords in item names to lucide icons
function getItemIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("coffee")) return Coffee;
  if (n.includes("tea") || n.includes("leaves")) return Leaf;
  if (n.includes("water") || n.includes("dispenser")) return Droplets;
  if (n.includes("milk")) return Milk;
  if (n.includes("battery") || n.includes("batteries")) return Battery;
  if (n.includes("match")) return Flame;
  if (n.includes("chocolate") || n.includes("cocoa")) return Coffee;
  if (n.includes("soap") || n.includes("wash") || n.includes("sanitizer")) return Droplets;
  if (n.includes("spray") || n.includes("cleaner") || n.includes("jik") || n.includes("polish")) return SprayCan;
  if (n.includes("tissue") || n.includes("towel") || n.includes("serviette") || n.includes("roll")) return Wind;
  if (n.includes("glove")) return Shirt;
  if (n.includes("bag") || n.includes("snack") || n.includes("granola")) return ShoppingBag;
  if (n.includes("biscuit") || n.includes("cookie") || n.includes("cracker")) return Cookie;
  if (n.includes("sandwich") || n.includes("bread")) return Sandwich;
  if (n.includes("salad") || n.includes("vegetable") || n.includes("veg")) return Salad;
  if (n.includes("fish")) return Fish;
  if (n.includes("meat") || n.includes("beef") || n.includes("chicken")) return Beef;
  if (n.includes("flour") || n.includes("wheat") || n.includes("rice") || n.includes("sugar")) return Wheat;
  if (n.includes("egg")) return Egg;
  if (n.includes("flask") || n.includes("chemical") || n.includes("liquid")) return FlaskConical;
  if (n.includes("thermometer")) return Thermometer;
  if (n.includes("wrench") || n.includes("tool")) return Wrench;
  if (n.includes("bulb") || n.includes("light")) return Lightbulb;
  if (n.includes("printer") || n.includes("paper") || n.includes("ink")) return Printer;
  if (n.includes("monitor") || n.includes("screen")) return Monitor;
  if (n.includes("phone") || n.includes("charger")) return Phone;
  if (n.includes("wifi") || n.includes("router")) return Wifi;
  if (n.includes("apple") || n.includes("fruit")) return Apple;
  if (n.includes("kitchen") || n.includes("utensil") || n.includes("spoon") || n.includes("fork")) return Utensils;
  if (n.includes("trash") || n.includes("bin") || n.includes("waste")) return Trash2;
  if (n.includes("box") || n.includes("carton")) return Box;
  return Package;
}

const CATEGORY_ICONS: Record<string, any> = {
  "Kitchen Essentials": Utensils,
  "Washroom Essentials": Droplets,
  "Water Count": Waves,
  "Kitchen Stock": ShoppingBag,
  "Snacks": Apple,
  "Other Purchases": Package,
};

export function StockManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_items: 0, categories_count: 0 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stockResponse, statsResponse] = await Promise.all([
        api.getAllStock(),
        api.getStockStats(),
      ]);
      setStockItems(stockResponse.data || []);
      setStats(statsResponse.stats || { total_items: 0, categories_count: 0 });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupedItems = CATEGORY_ORDER.reduce((acc, category) => {
    const items = stockItems.filter(
      (item) =>
        item.category === category &&
        (item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    if (items.length > 0) acc[category] = items;
    return acc;
  }, {} as Record<string, StockItem[]>);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Stats */}
      <div className="flex gap-6">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Items</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{loading ? "—" : stats.total_items}</p>
        </div>
        <div className="w-px bg-gray-200 dark:bg-gray-700" />
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categories</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{loading ? "—" : stats.categories_count}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search items or categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Category Panels */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : Object.keys(groupedItems).length === 0 ? (
        <div className="text-center py-16 text-gray-400">No items found</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedItems).map(([category, items]) => {
            const totalQty = items.reduce((s, i) => s + (i.current_quantity || 0), 0);
            const CatIcon = CATEGORY_ICONS[category] || Package;
            return (
              <div
                key={category}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2235] shadow-md overflow-hidden"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                  <div className="flex items-center gap-3">
                    <CatIcon className="w-5 h-5 text-[#D1131B]" />
                    <h2 className="text-base font-bold text-gray-800 dark:text-white">{category}</h2>
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D1131B] text-white text-xs font-bold">
                      {items.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                      Total Stock: <span className="font-bold text-gray-800 dark:text-white">{totalQty}</span> units
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/dashboard/stock-management/${encodeURIComponent(category)}`)}
                      className="flex items-center gap-1.5 text-[#D1131B] hover:text-[#D1131B] hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Item Grid */}
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {items.map((item) => {
                    const Icon = getItemIcon(item.item_name);
                    const isLow = item.current_quantity <= 3;
                    return (
                      <div
                        key={item.id}
                        className={`relative flex items-center gap-3 px-3 py-3 rounded-xl border transition-all
                          ${isLow
                            ? "border-[#D1131B]/60 bg-red-50/40 dark:bg-red-900/10 dark:border-[#D1131B]/50"
                            : "border-gray-200 dark:border-gray-600/60 bg-gray-50 dark:bg-[#111827]/60"
                          }`}
                      >
                        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                          ${isLow ? "bg-[#D1131B]/10 dark:bg-[#D1131B]/20" : "bg-gray-200/70 dark:bg-gray-700/60"}`}>
                          <Icon className={`w-4 h-4 ${isLow ? "text-[#D1131B]" : "text-gray-500 dark:text-gray-400"}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 dark:text-white leading-tight truncate">{item.item_name}</p>
                          <p className={`text-xs font-bold mt-0.5 ${isLow ? "text-[#D1131B]" : "text-gray-500 dark:text-gray-400"}`}>
                            {item.current_quantity} {item.unit}
                          </p>
                          {isLow && (
                            <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#D1131B]/70" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
