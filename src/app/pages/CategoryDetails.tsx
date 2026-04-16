import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Plus, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { api } from "../../services/api";
import { toast } from "sonner";

function fmt(d) {
  const dt = new Date(d);
  return String(dt.getDate()).padStart(2,"0")+"/"+String(dt.getMonth()+1).padStart(2,"0")+"/"+String(dt.getFullYear()).slice(2);
}
function today() { return new Date().toISOString().split("T")[0]; }

const TH = "border border-gray-400 dark:border-gray-600 px-2 py-2 text-[11px] font-bold text-center whitespace-nowrap bg-[#2E4057] text-white";
const MON = "border border-gray-400 dark:border-gray-600 px-2 py-1 text-[11px] font-bold text-center bg-[#4472C4] text-white whitespace-nowrap";
const TD = "border border-gray-300 dark:border-gray-600 px-2 py-1 text-[11px] text-center whitespace-nowrap bg-white dark:bg-[#1a2235] text-gray-800 dark:text-gray-100";
const TDL = "border border-gray-300 dark:border-gray-600 px-2 py-1 text-[11px] text-left whitespace-nowrap bg-white dark:bg-[#1a2235] text-gray-800 dark:text-gray-100";
const TOT = "border border-gray-400 dark:border-gray-600 px-2 py-1 text-[11px] font-bold text-center bg-[#BDD7EE] dark:bg-[#1e3a5f] text-gray-900 dark:text-white whitespace-nowrap";
const TOTL = "border border-gray-400 dark:border-gray-600 px-2 py-1 text-[11px] font-bold text-left bg-[#BDD7EE] dark:bg-[#1e3a5f] text-gray-900 dark:text-white whitespace-nowrap";
const TRD = "border border-gray-400 dark:border-gray-600 px-2 py-1 text-[11px] font-bold text-center bg-[#C00000] text-white whitespace-nowrap";
const TRDL = "border border-gray-400 dark:border-gray-600 px-2 py-1 text-[11px] font-bold text-left bg-[#C00000] text-white whitespace-nowrap";
const CMT = "border border-gray-300 dark:border-gray-600 px-2 py-1 text-[11px] text-gray-400 whitespace-nowrap bg-white dark:bg-[#1a2235]";

function AddPurchaseModal({ items, onClose, onSave }) {
  const [date, setDate] = useState(today());
  const [qty, setQty] = useState({});
  const [saving, setSaving] = useState(false);
  const save = async () => {
    const entries = Object.entries(qty).filter(([,v]) => v && Number(v) > 0);
    if (!entries.length) { toast.error("Enter at least one quantity"); return; }
    setSaving(true);
    try {
      await Promise.all(entries.map(([id, q]) => api.addPurchaseHistory(id, { quantity: Number(q), purchase_date: date, unit_price: 0, notes: "" })));
      toast.success("Purchase saved"); onSave();
    } catch(e) { toast.error(e.message || "Failed"); } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">Add Purchase Entry</h2>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">Date</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] text-gray-900 dark:text-white px-3 py-2 text-sm"/>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="text-xs text-gray-700 dark:text-gray-300 w-44 truncate">{item.item_name} ({item.unit})</span>
              <input type="number" min="0" placeholder="0" value={qty[item.id]||""} onChange={e=>setQty(p=>({...p,[item.id]:e.target.value}))} className="w-20 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] text-gray-900 dark:text-white px-2 py-1 text-sm text-center"/>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={save} disabled={saving} className="bg-[#D1131B] hover:bg-[#b01016] text-white">{saving?"Saving...":"Save"}</Button>
        </div>
      </div>
    </div>
  );
}

function AddWaterModal({ onClose, onSave }) {
  const [date, setDate] = useState(today());
  const [bottles, setBottles] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!bottles || Number(bottles) <= 0) { toast.error("Enter bottles count"); return; }
    setSaving(true);
    try {
      await api.addWaterDelivery({ delivery_date: date, bottles_delivered: Number(bottles), notes: "" });
      toast.success("Delivery saved"); onSave();
    } catch(e) { toast.error(e.message || "Failed"); } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">Add Water Delivery</h2>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">Date</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] text-gray-900 dark:text-white px-3 py-2 text-sm"/>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">Bottles Delivered</label>
          <input type="number" min="1" placeholder="0" value={bottles} onChange={e=>setBottles(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] text-gray-900 dark:text-white px-3 py-2 text-sm text-center"/>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={save} disabled={saving} className="bg-[#4472C4] hover:bg-[#3560a8] text-white">{saving?"Saving...":"Save"}</Button>
        </div>
      </div>
    </div>
  );
}

function MonthlyTable({ items, months, canAdd, onAdd }) {
  const cols = items.length + 3;
  return (
    <div className="space-y-3">
      {canAdd && (
        <div className="flex justify-end">
          <Button size="sm" onClick={onAdd} className="flex items-center gap-1.5 bg-[#D1131B] hover:bg-[#b01016] text-white text-xs">
            <Plus className="w-3.5 h-3.5"/> Add Purchase Entry
          </Button>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-300 dark:border-gray-700 shadow">
        <table className="border-collapse" style={{minWidth:"100%",fontSize:"11px"}}>
          <thead>
            <tr>
              <th className={`${TH} min-w-[52px] sticky left-0 z-20`}>Month</th>
              <th className={`${TH} min-w-[80px]`}>Date</th>
              {items.map(i => <th key={i.id} className={`${TH} min-w-[88px]`}>{i.item_name}{i.unit?` (${i.unit})`:""}</th>)}
              <th className={`${TH} min-w-[90px]`}>Comments</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m, mi) => {
              const dates = Object.keys(m.dates).sort();
              const prev = mi > 0 ? months[mi-1] : null;
              const short = new Date(m.key+"-01").toLocaleString("en-GB",{month:"short"}).toUpperCase();
              const full = new Date(m.key+"-01").toLocaleString("en-GB",{month:"long"}).toUpperCase();
              const ps = prev ? new Date(prev.key+"-01").toLocaleString("en-GB",{month:"short"}).toUpperCase() : "";
              return (
                <>
                  {dates.map((d, di) => (
                    <tr key={`${m.key}-${d}`}>
                      {di===0 && <td rowSpan={dates.length} className={`${MON} sticky left-0 z-10`}>{short}</td>}
                      <td className={TDL}>{fmt(d)}</td>
                      {items.map(i => <td key={i.id} className={TD}>{m.dates[d]?.[i.id] != null ? m.dates[d][i.id] : ""}</td>)}
                      <td className={CMT}></td>
                    </tr>
                  ))}
                  <tr key={`${m.key}-tot`}>
                    <td className={`${TOT} sticky left-0 z-10`}>TOTAL</td>
                    <td className={TOTL}>{full}</td>
                    {items.map(i => <td key={i.id} className={TOT}>{m.totals[i.id]??0}</td>)}
                    <td className={TOT}></td>
                  </tr>
                  {prev && (
                    <tr key={`${m.key}-trd`}>
                      <td className={`${TRD} sticky left-0 z-10`}>TREND</td>
                      <td className={TRDL}>vs {ps}</td>
                      {items.map(i => { const v=m.trends[i.id]??0; return <td key={i.id} className={TRD}>{v>0?`+${v}`:v}</td>; })}
                      <td className={TRD}></td>
                    </tr>
                  )}
                  <tr key={`${m.key}-sp`}><td colSpan={cols} className="h-3 bg-gray-100 dark:bg-[#111827] border-0"></td></tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WaterTable({ months, stats, canAdd, onAdd, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[["Grand Total",`${stats.grand_total} btl`],["Deliveries",stats.total_deliveries],["Avg/Delivery",`${stats.average_per_delivery} btl`],["Max",`${stats.max_delivery} btl`],["Min",`${stats.min_delivery} btl`]].map(([l,v])=>(
          <div key={l} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2235] p-3 text-center shadow-sm">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">{l}</p>
            <p className="text-sm font-bold text-[#2E4057] dark:text-blue-300 mt-1">{v}</p>
          </div>
        ))}
      </div>
      {canAdd && (
        <div className="flex justify-end">
          <Button size="sm" onClick={onAdd} className="flex items-center gap-1.5 bg-[#4472C4] hover:bg-[#3560a8] text-white text-xs">
            <PlusCircle className="w-3.5 h-3.5"/> Add Delivery
          </Button>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-300 dark:border-gray-700 shadow">
        <table className="border-collapse" style={{minWidth:"480px",fontSize:"11px"}}>
          <thead>
            <tr>
              <th className={`${TH} min-w-[140px]`}>Delivery Date</th>
              <th className={`${TH} min-w-[150px]`}>Bottles Delivered</th>
              <th className={`${TH} min-w-[140px]`}>Total in Month</th>
              {canAdd && <th className={`${TH} min-w-[50px]`}></th>}
            </tr>
            <tr>
              <th className={`${TH} text-[10px]`}>DELIVERY DATE</th>
              <th className={`${TH} text-[10px]`}>BOTTLES DELIVERED</th>
              <th className={`${TH} text-[10px]`}>TOTAL IN MONTHS</th>
              {canAdd && <th className={`${TH} text-[10px]`}>DEL</th>}
            </tr>
          </thead>
          <tbody>
            {months.map(mon => (
              <>
                {mon.deliveries.map((d,i) => {
                  const last = i===mon.deliveries.length-1;
                  const rc = last ? "bg-[#BDD7EE] dark:bg-[#1e3a5f] font-bold text-gray-900 dark:text-white" : "bg-white dark:bg-[#1a2235] text-gray-800 dark:text-gray-100";
                  const cc = `border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-center text-[11px] whitespace-nowrap ${rc}`;
                  return (
                    <tr key={d.id} className={rc}>
                      <td className={cc}>{fmt(d.delivery_date)}</td>
                      <td className={cc}>{d.bottles_delivered}</td>
                      <td className={cc}>{last?mon.total:""}</td>
                      {canAdd && <td className={`border border-gray-300 dark:border-gray-600 px-2 py-1 text-center ${rc}`}><button onClick={()=>onDelete(d.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3.5 h-3.5"/></button></td>}
                    </tr>
                  );
                })}
                <tr key={`${mon.label}-sp`}><td colSpan={canAdd?4:3} className="h-3 bg-gray-100 dark:bg-[#111827] border-0"></td></tr>
              </>
            ))}
            <tr className="bg-[#2E4057] text-white font-bold">
              <td className="border border-gray-400 px-3 py-2 text-center text-[11px]">GRAND TOTAL</td>
              <td className="border border-gray-400 px-3 py-2 text-center text-[11px]">{stats.grand_total}</td>
              <td className="border border-gray-400 px-3 py-2 text-center text-[11px]">{stats.grand_total}</td>
              {canAdd && <td className="border border-gray-400 px-3 py-2"></td>}
            </tr>
            {[["Average per delivery",stats.average_per_delivery],["Max delivery",stats.max_delivery],["Min delivery",stats.min_delivery],["Total deliveries",stats.total_deliveries]].map(([l,v])=>(
              <tr key={l} className="bg-white dark:bg-[#1a2235]">
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-1 text-left text-[11px] text-gray-700 dark:text-gray-300 font-medium">{l}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-1 text-center text-[11px] font-bold text-gray-800 dark:text-white">{v}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-1"></td>
                {canAdd && <td className="border border-gray-300 dark:border-gray-600 px-3 py-1"></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KitchenStockTable({ items }) {
  const tc = items.reduce((s,i)=>s+(i.current_quantity||0),0);
  const tp = items.reduce((s,i)=>s+(i.purchased_qty||0),0);
  const tt = items.reduce((s,i)=>s+(i.total_qty||0),0);
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 dark:border-gray-700 shadow">
      <table className="border-collapse" style={{minWidth:"600px",fontSize:"11px"}}>
        <thead>
          <tr>
            <th className={`${TH} min-w-[36px]`}>#</th>
            <th className={`${TH} min-w-[180px] text-left`}>Item Name</th>
            <th className={`${TH} min-w-[100px]`}>Current Qty</th>
            <th className={`${TH} min-w-[100px]`}>Purchased</th>
            <th className={`${TH} min-w-[80px]`}>Total</th>
            <th className={`${TH} min-w-[120px]`}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item,idx) => {
            const bg = idx%2===0 ? "bg-white dark:bg-[#1a2235]" : "bg-gray-50 dark:bg-[#111827]";
            const c = `border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-center text-[11px] whitespace-nowrap ${bg} text-gray-800 dark:text-gray-100`;
            return (
              <tr key={item.id} className={bg}>
                <td className={`${c} text-gray-500`}>{idx+1}</td>
                <td className={`${c} text-left font-medium`}>{item.item_name}</td>
                <td className={c}>{item.current_quantity||""}</td>
                <td className={c}>{item.purchased_qty||""}</td>
                <td className={c}>{item.total_qty||""}</td>
                <td className={`${c} text-gray-500 dark:text-gray-400`}>{item.notes||""}</td>
              </tr>
            );
          })}
          <tr className="bg-[#BDD7EE] dark:bg-[#1e3a5f] font-bold">
            <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[11px]"></td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-left text-[11px] font-bold text-gray-900 dark:text-white">TOTAL ITEMS IN INVENTORY</td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[11px] font-bold text-gray-900 dark:text-white">{tc}</td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[11px] font-bold text-gray-900 dark:text-white">{tp||""}</td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[11px] font-bold text-gray-900 dark:text-white">{tt||""}</td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function CategoryDetails() {
  const { category } = useParams();
  const navigate = useNavigate();
  const cat = decodeURIComponent(category || "");
  const [loading, setLoading] = useState(true);
  const [monthly, setMonthly] = useState(null);
  const [water, setWater] = useState(null);
  const [stock, setStock] = useState([]);
  const [showPurchase, setShowPurchase] = useState(false);
  const [showWater, setShowWater] = useState(false);

  useEffect(() => { if (cat) load(); }, [cat]);

  const load = async () => {
    setLoading(true);
    try {
      if (cat === "Water Count") {
        const r = await api.getWaterDeliveries();
        setWater({ months: r.months||[], stats: r.stats||{} });
      } else if (cat === "Kitchen Stock") {
        const r = await api.getMonthlyCategoryPurchases(cat);
        setStock(r.items||[]);
      } else {
        const r = await api.getMonthlyCategoryPurchases(cat);
        setMonthly({ items: r.items||[], months: r.months||[] });
      }
    } catch(e) { console.error(e); toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  const delDelivery = async (id) => {
    if (!confirm("Delete this delivery?")) return;
    try { await api.deleteWaterDelivery(id); toast.success("Deleted"); load(); }
    catch(e) { toast.error(e.message||"Failed"); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={()=>navigate("/dashboard/stock-management")} className="flex items-center gap-2 dark:border-gray-600 dark:text-gray-200">
          <ArrowLeft className="w-4 h-4"/> Back
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{cat}</h1>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            {cat==="Water Count"?"Delivery log — Sep 2025 to present":cat==="Kitchen Stock"?"Durable items inventory":"Monthly purchase log — Sep 2025 to present"}
          </p>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 text-sm">Loading...</div>
      ) : (
        <>
          {cat==="Water Count" && water && <WaterTable months={water.months} stats={water.stats} canAdd={true} onAdd={()=>setShowWater(true)} onDelete={delDelivery}/>}
          {cat==="Kitchen Stock" && <KitchenStockTable items={stock}/>}
          {(cat==="Kitchen Essentials"||cat==="Washroom Essentials"||cat==="Snacks"||cat==="Other Purchases") && monthly && (
            <MonthlyTable items={monthly.items} months={monthly.months} canAdd={true} onAdd={()=>setShowPurchase(true)}/>
          )}
        </>
      )}
      {showPurchase && monthly && <AddPurchaseModal items={monthly.items} onClose={()=>setShowPurchase(false)} onSave={()=>{setShowPurchase(false);load();}}/>}
      {showWater && <AddWaterModal onClose={()=>setShowWater(false)} onSave={()=>{setShowWater(false);load();}}/>}
    </div>
  );
}