import { useState, useEffect } from "react";
import { Search, ExternalLink, Utensils, Droplets, Waves, ShoppingBag, Apple, Package, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { api } from "../../services/api";
import { toast } from "sonner";

const CATS = ["Kitchen Essentials","Washroom Essentials","Water Count","Kitchen Stock","Snacks","Other Purchases"];
const CAT_ICONS = { "Kitchen Essentials": Utensils, "Washroom Essentials": Droplets, "Water Count": Waves, "Kitchen Stock": ShoppingBag, "Snacks": Apple, "Other Purchases": Package };

// Add Category Modal
function AddCategoryModal({ onClose, onSave }) {
  const [catName, setCatName] = useState("");
  const [items, setItems] = useState([{ name:"", unit:"" }]);
  const [saving, setSaving] = useState(false);
  const addRow = () => setItems(p=>[...p,{name:"",unit:""}]);
  const removeRow = (i) => setItems(p=>p.filter((_,idx)=>idx!==i));
  const update = (i,f,v) => setItems(p=>p.map((r,idx)=>idx===i?{...r,[f]:v}:r));
  const save = async () => {
    if (!catName.trim()) { toast.error("Enter category name"); return; }
    const valid = items.filter(i=>i.name.trim()&&i.unit.trim());
    if (!valid.length) { toast.error("Add at least one item with name and unit"); return; }
    setSaving(true);
    try {
      await Promise.all(valid.map(item=>api.createStockItem({category:catName.trim(),item_name:item.name.trim(),current_quantity:0,unit:item.unit.trim(),is_durable:false,notes:""})));
      toast.success(`Category "${catName}" created`); onSave();
    } catch(e) { toast.error(e.message||"Failed"); } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Add New Category</h2>
          <p className="text-xs text-gray-400 mt-0.5">New category will appear with the same table structure as existing ones</p>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Category Name *</label>
          <input placeholder="e.g. Office Supplies, Electronics..." value={catName} onChange={e=>setCatName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] text-gray-900 dark:text-white px-3 py-2 text-sm"/>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Items *</label>
            <button onClick={addRow} className="flex items-center gap-1 text-xs text-[#D1131B] hover:underline font-medium"><Plus className="w-3 h-3"/> Add item</button>
          </div>
          <div className="space-y-2">
            {items.map((item,i)=>(
              <div key={i} className="flex items-center gap-2">
                <input placeholder="Item name" value={item.name} onChange={e=>update(i,"name",e.target.value)} className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] text-gray-900 dark:text-white px-2 py-1.5 text-xs"/>
                <input placeholder="Unit (kg, pcs...)" value={item.unit} onChange={e=>update(i,"unit",e.target.value)} className="w-28 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] text-gray-900 dark:text-white px-2 py-1.5 text-xs"/>
                {items.length>1&&<button onClick={()=>removeRow(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300">
          The new category will appear on this page with Month/Date/TOTAL/REMAINING/TREND table structure.
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
          <button onClick={save} disabled={saving} className="px-3 py-1.5 text-xs rounded-lg bg-[#D1131B] hover:bg-[#b01016] text-white font-medium">{saving?"Creating...":"Create Category"}</button>
        </div>
      </div>
    </div>
  );
}

export function StockManagement() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total_items: 0, categories_count: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddCat, setShowAddCat] = useState(false);
  const [allCats, setAllCats] = useState(CATS);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [s, st] = await Promise.all([api.getAllStock(), api.getStockStats()]);
      setItems(s.data || []);
      setStats(st.stats || { total_items: 0, categories_count: 0 });
      // Discover any custom categories not in default list
      const cats = [...new Set((s.data||[]).map(i => i.category))];
      setAllCats(prev => [...new Set([...prev, ...cats])]);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const grouped = allCats.reduce((acc, cat) => {
    const list = items.filter(i => i.category === cat && (i.item_name.toLowerCase().includes(search.toLowerCase()) || cat.toLowerCase().includes(search.toLowerCase())));
    if (list.length) acc[cat] = list;
    return acc;
  }, {});

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-6">
          <div><p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Items</p><p className="text-3xl font-bold text-gray-800 dark:text-white">{loading ? "—" : stats.total_items}</p></div>
          <div className="w-px bg-gray-200 dark:bg-gray-700" />
          <div><p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categories</p><p className="text-3xl font-bold text-gray-800 dark:text-white">{loading ? "—" : stats.categories_count}</p></div>
        </div>
        <button onClick={()=>setShowAddCat(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2E4057] hover:bg-[#1e2d3d] text-white text-xs font-medium">
          <Plus className="w-3.5 h-3.5"/> Add Category
        </button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input placeholder="Search items or categories..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D1131B]" />
      </div>
      {loading ? <div className="text-center py-16 text-gray-400">Loading...</div> : Object.keys(grouped).length === 0 ? <div className="text-center py-16 text-gray-400">No items found</div> : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, list]) => {
            const Icon = CAT_ICONS[cat] || Package;
            const total = list.reduce((s, i) => s + (i.current_quantity || 0), 0);
            return (
              <div key={cat} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2235] shadow-md overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-[#D1131B]" />
                    <h2 className="text-base font-bold text-gray-800 dark:text-white">{cat}</h2>
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D1131B] text-white text-xs font-bold">{list.length}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Total: <span className="font-bold text-gray-800 dark:text-white">{total}</span> units</span>
                    <button onClick={() => nav(`/dashboard/stock-management/${encodeURIComponent(cat)}`)} className="flex items-center gap-1.5 text-[#D1131B] hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-sm px-3 py-1.5 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4" /> View Details
                    </button>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {list.map(item => {
                    const low = item.current_quantity <= 3;
                    return (
                      <div key={item.id} className={`relative flex flex-col px-3 py-3 rounded-xl border transition-all ${low ? "border-[#D1131B]/60 bg-red-50/40 dark:bg-red-900/10" : "border-gray-200 dark:border-gray-600/60 bg-gray-50 dark:bg-[#111827]/60"}`}>
                        <p className="text-xs font-semibold text-gray-800 dark:text-white leading-tight truncate">{item.item_name}</p>
                        <p className={`text-xs font-bold mt-1 ${low ? "text-[#D1131B]" : "text-gray-500 dark:text-gray-400"}`}>{item.current_quantity} {item.unit}</p>
                        {low && <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#D1131B]/70" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showAddCat && <AddCategoryModal onClose={()=>setShowAddCat(false)} onSave={()=>{setShowAddCat(false);load();}}/>}
    </div>
  );
}