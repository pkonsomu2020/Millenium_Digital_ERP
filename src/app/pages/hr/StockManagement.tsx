import { useState, useEffect } from "react";
import { Search, ExternalLink, Utensils, Droplets, Waves, ShoppingBag, Apple, Package } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { api } from "../../../services/api";
import { useNavigate } from "react-router";

const ORDER = ["Kitchen Essentials","Washroom Essentials","Water Count","Kitchen Stock","Snacks","Other Purchases"];
const ICONS = {"Kitchen Essentials":Utensils,"Washroom Essentials":Droplets,"Water Count":Waves,"Kitchen Stock":ShoppingBag,"Snacks":Apple,"Other Purchases":Package};

export function HRStockManagement() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_items:0, categories_count:0 });

  useEffect(() => { load(); const t=setInterval(load,30000); return ()=>clearInterval(t); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [s, st] = await Promise.all([api.getAllStock(), api.getStockStats()]);
      setItems(s.data||[]);
      setStats(st.stats||{total_items:0,categories_count:0});
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const grouped = ORDER.reduce((acc, cat) => {
    const list = items.filter(i => i.category===cat && (i.item_name.toLowerCase().includes(q.toLowerCase()) || cat.toLowerCase().includes(q.toLowerCase())));
    if (list.length) acc[cat] = list;
    return acc;
  }, {});

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex gap-6">
        <div><p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Items</p><p className="text-3xl font-bold text-gray-800 dark:text-white">{loading?"—":stats.total_items}</p></div>
        <div className="w-px bg-gray-200 dark:bg-gray-700"/>
        <div><p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categories</p><p className="text-3xl font-bold text-gray-800 dark:text-white">{loading?"—":stats.categories_count}</p></div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
        <Input placeholder="Search items or categories..." value={q} onChange={e=>setQ(e.target.value)} className="pl-9 dark:bg-gray-800 dark:border-gray-600 dark:text-white"/>
      </div>
      {loading ? <div className="text-center py-16 text-gray-400">Loading...</div> :
        Object.keys(grouped).length===0 ? <div className="text-center py-16 text-gray-400">No items found</div> : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, list]) => {
            const total = list.reduce((s,i)=>s+(i.current_quantity||0),0);
            const Icon = ICONS[cat]||Package;
            return (
              <div key={cat} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2235] shadow-md overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-[#D1131B]"/>
                    <h2 className="text-base font-bold text-gray-800 dark:text-white">{cat}</h2>
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D1131B] text-white text-xs font-bold">{list.length}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Total Stock: <span className="font-bold text-gray-800 dark:text-white">{total}</span> units</span>
                    <Button variant="ghost" size="sm" onClick={()=>navigate(`/hr/dashboard/stock-management/${encodeURIComponent(cat)}`)} className="flex items-center gap-1.5 text-[#D1131B] hover:text-[#D1131B] hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-sm">
                      <ExternalLink className="w-4 h-4"/>View Details
                    </Button>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {list.map(item => {
                    const low = item.current_quantity<=3;
                    return (
                      <div key={item.id} className={`relative flex items-center gap-3 px-3 py-3 rounded-xl border transition-all ${low?"border-[#D1131B]/60 bg-red-50/40 dark:bg-red-900/10 dark:border-[#D1131B]/50":"border-gray-200 dark:border-gray-600/60 bg-gray-50 dark:bg-[#111827]/60"}`}>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 dark:text-white leading-tight truncate">{item.item_name}</p>
                          <p className={`text-xs font-bold mt-0.5 ${low?"text-[#D1131B]":"text-gray-500 dark:text-gray-400"}`}>{item.current_quantity} {item.unit}</p>
                          {low && <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#D1131B]/70"/>}
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