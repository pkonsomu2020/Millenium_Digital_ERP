import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Plus, PlusCircle, Trash2, CalendarPlus, Pencil, Check, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { api } from "../../services/api";
import { toast } from "sonner";

function fmt(d) {
  const dt = new Date(d);
  return String(dt.getDate()).padStart(2,"0")+"/"+String(dt.getMonth()+1).padStart(2,"0")+"/"+String(dt.getFullYear()).slice(2);
}
function today() { return new Date().toISOString().split("T")[0]; }

const TH="border border-gray-400 dark:border-gray-600 px-2 py-2 text-[11px] font-bold text-center whitespace-nowrap bg-[#2E4057] text-white";
const MON="border border-gray-400 dark:border-gray-600 px-2 py-1 text-[11px] font-bold text-center bg-[#4472C4] text-white whitespace-nowrap";
const TD="border border-gray-300 dark:border-gray-600 px-2 py-1 text-[11px] text-center whitespace-nowrap bg-white dark:bg-[#1a2235] text-gray-800 dark:text-gray-100";
const TDL="border border-gray-300 dark:border-gray-600 px-2 py-1 text-[11px] text-left whitespace-nowrap bg-white dark:bg-[#1a2235] text-gray-800 dark:text-gray-100";
const TOT="border border-gray-400 dark:border-gray-600 px-2 py-1 text-[11px] font-bold text-center bg-[#BDD7EE] dark:bg-[#1e3a5f] text-gray-900 dark:text-white whitespace-nowrap";
const TOTL="border border-gray-400 dark:border-gray-600 px-2 py-1 text-[11px] font-bold text-left bg-[#BDD7EE] dark:bg-[#1e3a5f] text-gray-900 dark:text-white whitespace-nowrap";
const TRD="border border-gray-400 dark:border-gray-600 px-2 py-1 text-[11px] font-bold text-center bg-[#C00000] text-white whitespace-nowrap";
const TRDL="border border-gray-400 dark:border-gray-600 px-2 py-1 text-[11px] font-bold text-left bg-[#C00000] text-white whitespace-nowrap";
const CMT="border border-gray-300 dark:border-gray-600 px-2 py-1 text-[11px] whitespace-nowrap bg-white dark:bg-[#1a2235] text-gray-700 dark:text-gray-300";
const REM="border border-gray-400 dark:border-gray-600 px-2 py-1 text-[11px] font-bold text-center bg-[#70AD47] text-white whitespace-nowrap";

// ── Editable number cell ──────────────────────────────────────────────────────
function EditableCell({ value, onSave, className }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value ?? "");
  const ref = useRef(null);
  useEffect(() => { if (editing) ref.current?.select(); }, [editing]);
  const commit = async () => {
    setEditing(false);
    const num = val === "" ? null : Number(val);
    if (num === value || (val === "" && value == null)) return;
    if (val !== "" && isNaN(num)) { setVal(value ?? ""); return; }
    await onSave(num);
  };
  if (editing) return (
    <td className={className} style={{padding:0}}>
      <input ref={ref} type="number" min="0" value={val}
        onChange={e=>setVal(e.target.value)} onBlur={commit}
        onKeyDown={e=>{if(e.key==="Enter")commit();if(e.key==="Escape"){setEditing(false);setVal(value??"");}}}
        className="w-full h-full px-1 py-1 text-[11px] text-center bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-400 outline-none" style={{minWidth:"60px"}}/>
    </td>
  );
  return (
    <td className={`${className} cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:outline hover:outline-2 hover:outline-yellow-400`}
      onClick={()=>setEditing(true)} title="Click to edit">
      {value != null && value !== "" ? value : ""}
    </td>
  );
}

// ── Editable text cell (comments) ─────────────────────────────────────────────
function EditableTextCell({ value, onSave, className }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value ?? "");
  const ref = useRef(null);
  useEffect(() => { setVal(value ?? ""); }, [value]);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  const commit = async () => {
    setEditing(false);
    if (val === (value ?? "")) return;
    await onSave(val);
  };
  if (editing) return (
    <td className={className} style={{padding:0}}>
      <input ref={ref} type="text" value={val}
        onChange={e=>setVal(e.target.value)} onBlur={commit}
        onKeyDown={e=>{if(e.key==="Enter")commit();if(e.key==="Escape"){setEditing(false);setVal(value??"");}}}
        className="w-full h-full px-2 py-1 text-[11px] bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-400 outline-none" style={{minWidth:"80px"}}/>
    </td>
  );
  return (
    <td className={`${className} cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:outline hover:outline-2 hover:outline-yellow-400`}
      onClick={()=>setEditing(true)} title="Click to add comment">
      {value || ""}
    </td>
  );
}

// ── Editable date/month cell ──────────────────────────────────────────────────
function EditableDateCell({ value, isMonth, rowSpan, displayValue, onSave, className }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const ref = useRef(null);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);
  const commit = async () => {
    setEditing(false);
    if (!val || val === value) return;
    await onSave(val);
  };
  if (editing) {
    const inp = <input ref={ref} type={isMonth?"month":"date"}
      value={isMonth?value.slice(0,7):val}
      onChange={e=>setVal(isMonth?e.target.value+"-01":e.target.value)}
      onBlur={commit} onKeyDown={e=>{if(e.key==="Enter")commit();if(e.key==="Escape"){setEditing(false);setVal(value);}}}
      className="w-full px-1 py-1 text-[11px] text-center bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-400 outline-none"
      style={{minWidth:isMonth?"70px":"90px"}}/>;
    return rowSpan ? <td rowSpan={rowSpan} className={className} style={{padding:0}}>{inp}</td>
                   : <td className={className} style={{padding:0}}>{inp}</td>;
  }
  const el = <span className="cursor-pointer hover:underline hover:text-yellow-600 dark:hover:text-yellow-400"
    onClick={()=>setEditing(true)} title="Click to edit">{displayValue}</span>;
  return rowSpan ? <td rowSpan={rowSpan} className={`${className} cursor-pointer`}>{el}</td>
                 : <td className={`${className} cursor-pointer`}>{el}</td>;
}

// ── Add Purchase Modal ────────────────────────────────────────────────────────
function AddPurchaseModal({ items, cat, onClose, onSave }) {
  const [date, setDate] = useState(today());
  const [qty, setQty] = useState({});
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({ name:"", unit:"" });
  const [addingItem, setAddingItem] = useState(false);
  const [savingItem, setSavingItem] = useState(false);

  const saveNewItem = async () => {
    if (!newItem.name.trim()) { toast.error("Enter item name"); return; }
    if (!newItem.unit.trim()) { toast.error("Enter unit"); return; }
    setSavingItem(true);
    try {
      await api.createStockItem({ category:cat, item_name:newItem.name.trim(), current_quantity:0, unit:newItem.unit.trim(), is_durable:false, notes:"" });
      toast.success(`"${newItem.name}" added`);
      setNewItem({ name:"", unit:"" }); setAddingItem(false); onSave();
    } catch(e) { toast.error(e.message||"Failed"); } finally { setSavingItem(false); }
  };

  const save = async () => {
    const entries = Object.entries(qty).filter(([,v])=>v&&Number(v)>0);
    if (!entries.length) { toast.error("Enter at least one quantity"); return; }
    setSaving(true);
    try {
      await Promise.all(entries.map(([id,q])=>api.addPurchaseHistory(id,{quantity:Number(q),purchase_date:date,unit_price:0,notes:""})));
      toast.success("Purchase saved"); onSave();
    } catch(e) { toast.error(e.message||"Failed"); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">Add Purchase Entry</h2>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">Date</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] text-gray-900 dark:text-white px-3 py-2 text-sm"/>
        </div>
        <div className="space-y-2">
          {items.map(item=>(
            <div key={item.id} className="flex items-center gap-3">
              <span className="text-xs text-gray-700 dark:text-gray-300 flex-1 truncate">{item.item_name} <span className="text-gray-400">({item.unit})</span></span>
              <input type="number" min="0" placeholder="0" value={qty[item.id]||""} onChange={e=>setQty(p=>({...p,[item.id]:e.target.value}))} className="w-20 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] text-gray-900 dark:text-white px-2 py-1 text-sm text-center"/>
            </div>
          ))}
        </div>
        {addingItem ? (
          <div className="border border-dashed border-[#D1131B]/50 rounded-xl p-3 space-y-2 bg-red-50/30 dark:bg-red-900/10">
            <p className="text-xs font-semibold text-[#D1131B]">New Item</p>
            <div className="flex gap-2">
              <input placeholder="Item name" value={newItem.name} onChange={e=>setNewItem(p=>({...p,name:e.target.value}))} className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] text-gray-900 dark:text-white px-2 py-1 text-xs"/>
              <input placeholder="Unit (kg, pcs...)" value={newItem.unit} onChange={e=>setNewItem(p=>({...p,unit:e.target.value}))} className="w-28 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] text-gray-900 dark:text-white px-2 py-1 text-xs"/>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={saveNewItem} disabled={savingItem} className="bg-[#D1131B] hover:bg-[#b01016] text-white text-xs h-7">{savingItem?"Adding...":"Add Item"}</Button>
              <Button size="sm" variant="outline" onClick={()=>setAddingItem(false)} className="text-xs h-7">Cancel</Button>
            </div>
          </div>
        ) : (
          <button onClick={()=>setAddingItem(true)} className="flex items-center gap-1.5 text-xs text-[#D1131B] hover:underline font-medium">
            <Plus className="w-3.5 h-3.5"/> Add new item to this category
          </button>
        )}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={save} disabled={saving} className="bg-[#D1131B] hover:bg-[#b01016] text-white">{saving?"Saving...":"Save"}</Button>
        </div>
      </div>
    </div>
  );
}

// ── Add Water Modal ───────────────────────────────────────────────────────────
function AddWaterModal({ onClose, onSave }) {
  const [date, setDate] = useState(today());
  const [bottles, setBottles] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!bottles||Number(bottles)<=0) { toast.error("Enter bottles count"); return; }
    setSaving(true);
    try { await api.addWaterDelivery({delivery_date:date,bottles_delivered:Number(bottles),notes:""}); toast.success("Delivery saved"); onSave(); }
    catch(e) { toast.error(e.message||"Failed"); } finally { setSaving(false); }
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

// ── Add Row Modal ─────────────────────────────────────────────────────────────
function AddRowModal({ items, onClose, onSave }) {
  const [date, setDate] = useState(today());
  const [qty, setQty] = useState({});
  const [saving, setSaving] = useState(false);
  const save = async () => {
    const entries = Object.entries(qty).filter(([,v])=>v&&Number(v)>0);
    if (!entries.length) { toast.error("Enter at least one quantity"); return; }
    setSaving(true);
    try {
      await Promise.all(entries.map(([id,q])=>api.addPurchaseHistory(id,{quantity:Number(q),purchase_date:date,unit_price:0,notes:""})));
      toast.success("Row added"); onSave();
    } catch(e) { toast.error(e.message||"Failed"); } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Add Row / New Month</h2>
          <p className="text-xs text-gray-400 mt-0.5">Pick any date — appears in the correct month automatically</p>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">Date (May, June, July...)</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] text-gray-900 dark:text-white px-3 py-2 text-sm"/>
        </div>
        <div className="space-y-2">
          {items.map(item=>(
            <div key={item.id} className="flex items-center gap-3">
              <span className="text-xs text-gray-700 dark:text-gray-300 flex-1 truncate">{item.item_name} <span className="text-gray-400">({item.unit})</span></span>
              <input type="number" min="0" placeholder="0" value={qty[item.id]||""} onChange={e=>setQty(p=>({...p,[item.id]:e.target.value}))} className="w-20 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] text-gray-900 dark:text-white px-2 py-1 text-sm text-center"/>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={save} disabled={saving} className="bg-[#4472C4] hover:bg-[#3560a8] text-white">{saving?"Saving...":"Save"}</Button>
        </div>
      </div>
    </div>
  );
}

// ── Add Category Modal ────────────────────────────────────────────────────────
function AddCategoryModal({ onClose, onSave }) {
  const [catName, setCatName] = useState("");
  const [items, setItems] = useState([{ name:"", unit:"" }]);
  const [saving, setSaving] = useState(false);

  const addItemRow = () => setItems(p=>[...p,{name:"",unit:""}]);
  const removeItemRow = (i) => setItems(p=>p.filter((_,idx)=>idx!==i));
  const updateItem = (i, field, val) => setItems(p=>p.map((r,idx)=>idx===i?{...r,[field]:val}:r));

  const save = async () => {
    if (!catName.trim()) { toast.error("Enter category name"); return; }
    const validItems = items.filter(i=>i.name.trim()&&i.unit.trim());
    if (!validItems.length) { toast.error("Add at least one item with name and unit"); return; }
    setSaving(true);
    try {
      await Promise.all(validItems.map(item=>
        api.createStockItem({ category:catName.trim(), item_name:item.name.trim(), current_quantity:0, unit:item.unit.trim(), is_durable:false, notes:"" })
      ));
      toast.success(`Category "${catName}" created with ${validItems.length} item(s)`);
      onSave();
    } catch(e) { toast.error(e.message||"Failed to create category"); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Add New Category</h2>
          <p className="text-xs text-gray-400 mt-0.5">Creates a new category with the same table structure as existing ones</p>
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Category Name *</label>
          <input placeholder="e.g. Office Supplies, Electronics..." value={catName} onChange={e=>setCatName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] text-gray-900 dark:text-white px-3 py-2 text-sm"/>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Items in this category *</label>
            <button onClick={addItemRow} className="flex items-center gap-1 text-xs text-[#D1131B] hover:underline font-medium">
              <Plus className="w-3 h-3"/> Add item
            </button>
          </div>
          <div className="space-y-2">
            {items.map((item,i)=>(
              <div key={i} className="flex items-center gap-2">
                <input placeholder="Item name" value={item.name} onChange={e=>updateItem(i,"name",e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] text-gray-900 dark:text-white px-2 py-1.5 text-xs"/>
                <input placeholder="Unit (kg, pcs...)" value={item.unit} onChange={e=>updateItem(i,"unit",e.target.value)}
                  className="w-28 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] text-gray-900 dark:text-white px-2 py-1.5 text-xs"/>
                {items.length>1&&<button onClick={()=>removeItemRow(i)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4"/></button>}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300">
          The new category will appear on the Stock Management page with the same Month/Date/TOTAL/REMAINING/TREND table structure.
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={save} disabled={saving} className="bg-[#D1131B] hover:bg-[#b01016] text-white">{saving?"Creating...":"Create Category"}</Button>
        </div>
      </div>
    </div>
  );
}
// ── Monthly Table (admin — full edit) ─────────────────────────────────────────
function MonthlyTable({ items, months, onAdd, onAddRow, onCellSave, onDeleteRow, onDateChange, onCommentSave, comments }) {
  const cols = items.length + 4;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-gray-400 dark:text-gray-500">Click any cell to edit directly</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={onAddRow} className="flex items-center gap-1.5 bg-[#4472C4] hover:bg-[#3560a8] text-white text-xs">
            <CalendarPlus className="w-3.5 h-3.5"/> Add Row / New Month
          </Button>
          <Button size="sm" onClick={onAdd} className="flex items-center gap-1.5 bg-[#D1131B] hover:bg-[#b01016] text-white text-xs">
            <Plus className="w-3.5 h-3.5"/> Add Purchase Entry
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-300 dark:border-gray-700 shadow">
        <table className="border-collapse" style={{minWidth:"100%",fontSize:"11px"}}>
          <thead>
            <tr>
              <th className={`${TH} min-w-[52px] sticky left-0 z-20`}>Month</th>
              <th className={`${TH} min-w-[90px]`}>Date</th>
              {items.map(i=><th key={i.id} className={`${TH} min-w-[88px]`}>{i.item_name}{i.unit?` (${i.unit})`:""}</th>)}
              <th className={`${TH} min-w-[120px]`}>Comments</th>
              <th className={`${TH} min-w-[44px]`}>🗑</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m,mi)=>{
              const dates=Object.keys(m.dates).sort();
              const prev=mi>0?months[mi-1]:null;
              const short=new Date(m.key+"-01").toLocaleString("en-GB",{month:"short"}).toUpperCase();
              const full=new Date(m.key+"-01").toLocaleString("en-GB",{month:"long"}).toUpperCase();
              const ps=prev?new Date(prev.key+"-01").toLocaleString("en-GB",{month:"short"}).toUpperCase():"";
              const computedTotals={};
              items.forEach(i=>{computedTotals[i.id]=dates.reduce((s,d)=>s+(m.dates[d]?.[i.id]??0),0);});
              const computedTrends={};
              if(prev){const pd=Object.keys(prev.dates);items.forEach(i=>{const pt=pd.reduce((s,d)=>s+(prev.dates[d]?.[i.id]??0),0);computedTrends[i.id]=computedTotals[i.id]-pt;});}
              return(<>
                {dates.map((d,di)=>(
                  <tr key={`${m.key}-${d}`}>
                    {di===0&&<EditableDateCell value={m.key+"-01"} isMonth={true} rowSpan={dates.length} displayValue={short} onSave={nd=>onDateChange(d,nd,items)} className={`${MON} sticky left-0 z-10`}/>}
                    <EditableDateCell value={d} isMonth={false} displayValue={fmt(d)} onSave={nd=>onDateChange(d,nd,items)} className={TDL}/>
                    {items.map(i=><EditableCell key={i.id} value={m.dates[d]?.[i.id]??null} className={TD} onSave={v=>onCellSave(i.id,d,v)}/>)}
                    <EditableTextCell value={comments?.[d]||""} onSave={v=>onCommentSave(d,v)} className={CMT}/>
                    <td className="border border-gray-200 dark:border-gray-700 px-2 text-center bg-white dark:bg-[#1a2235]">
                      <button onClick={()=>onDeleteRow(d,items)} className="inline-flex items-center justify-center w-6 h-6 rounded bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Delete row">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </td>
                  </tr>
                ))}
                <tr key={`${m.key}-tot`}>
                  <td className={`${TOT} sticky left-0 z-10`}>TOTAL</td>
                  <td className={TOTL}>{full}</td>
                  {items.map(i=><td key={i.id} className={TOT}>{computedTotals[i.id]??0}</td>)}
                  <td className={TOT}></td><td className={TOT}></td>
                </tr>
                <tr key={`${m.key}-rem`}>
                  <td className={`${REM} sticky left-0 z-10`}>REMAINING</td>
                  <td className={REM}></td>
                  {items.map(i=><EditableCell key={i.id} value={null} className={REM} onSave={()=>{}}/>)}
                  <td className={REM}></td><td className={REM}></td>
                </tr>
                {prev&&(<tr key={`${m.key}-trd`}>
                  <td className={`${TRD} sticky left-0 z-10`}>TREND</td>
                  <td className={TRDL}>vs {ps}</td>
                  {items.map(i=>{const v=computedTrends[i.id]??0;return<td key={i.id} className={TRD}>{v>0?`+${v}`:v}</td>;})}
                  <td className={TRD}></td><td className={TRD}></td>
                </tr>)}
                <tr key={`${m.key}-sp`}><td colSpan={cols} className="h-3 bg-gray-100 dark:bg-[#111827] border-0"></td></tr>
              </>);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Water Count Table (admin — inline edit date + bottles + delete) ────────────
function WaterTable({ months, stats, onAdd, onDelete, onEditDelivery }) {
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
      <div className="flex justify-end">
        <Button size="sm" onClick={onAdd} className="flex items-center gap-1.5 bg-[#4472C4] hover:bg-[#3560a8] text-white text-xs">
          <PlusCircle className="w-3.5 h-3.5"/> Add Delivery
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-300 dark:border-gray-700 shadow">
        <table className="border-collapse" style={{minWidth:"520px",fontSize:"11px"}}>
          <thead>
            <tr>
              <th className={`${TH} min-w-[140px]`}>Delivery Date</th>
              <th className={`${TH} min-w-[150px]`}>Bottles Delivered</th>
              <th className={`${TH} min-w-[140px]`}>Total in Month</th>
              <th className={`${TH} min-w-[44px]`}>🗑</th>
            </tr>
            <tr>
              <th className={`${TH} text-[10px]`}>DELIVERY DATE</th>
              <th className={`${TH} text-[10px]`}>BOTTLES DELIVERED</th>
              <th className={`${TH} text-[10px]`}>TOTAL IN MONTHS</th>
              <th className={`${TH} text-[10px]`}>DEL</th>
            </tr>
          </thead>
          <tbody>
            {months.map(mon=>(
              <>
                {mon.deliveries.map((d,i)=>{
                  const last=i===mon.deliveries.length-1;
                  const rc=last?"bg-[#BDD7EE] dark:bg-[#1e3a5f] font-bold text-gray-900 dark:text-white":"bg-white dark:bg-[#1a2235] text-gray-800 dark:text-gray-100";
                  const cc=`border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-center text-[11px] whitespace-nowrap ${rc}`;
                  return(
                    <tr key={d.id} className={rc}>
                      <WaterEditableCell value={d.delivery_date} type="date" rowClass={rc}
                        onSave={v=>onEditDelivery(d.id,{delivery_date:v,bottles_delivered:d.bottles_delivered})}/>
                      <WaterEditableCell value={d.bottles_delivered} type="number" rowClass={rc}
                        onSave={v=>onEditDelivery(d.id,{delivery_date:d.delivery_date,bottles_delivered:Number(v)})}/>
                      <td className={cc}>{last?mon.total:""}</td>
                      <td className={`border border-gray-300 dark:border-gray-600 px-2 py-1 text-center ${rc}`}>
                        <button onClick={()=>onDelete(d.id)} className="inline-flex items-center justify-center w-6 h-6 rounded bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                <tr key={`${mon.label}-sp`}><td colSpan={4} className="h-3 bg-gray-100 dark:bg-[#111827] border-0"></td></tr>
              </>
            ))}
            <tr className="bg-[#2E4057] text-white font-bold">
              <td className="border border-gray-400 px-3 py-2 text-center text-[11px]">GRAND TOTAL</td>
              <td className="border border-gray-400 px-3 py-2 text-center text-[11px]">{stats.grand_total}</td>
              <td className="border border-gray-400 px-3 py-2 text-center text-[11px]">{stats.grand_total}</td>
              <td className="border border-gray-400 px-3 py-2"></td>
            </tr>
            {[["Average per delivery",stats.average_per_delivery],["Max delivery",stats.max_delivery],["Min delivery",stats.min_delivery],["Total deliveries",stats.total_deliveries]].map(([l,v])=>(
              <tr key={l} className="bg-white dark:bg-[#1a2235]">
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-1 text-left text-[11px] text-gray-700 dark:text-gray-300 font-medium">{l}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-1 text-center text-[11px] font-bold text-gray-800 dark:text-white">{v}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-1"></td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-1"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Inline editable cell for water table (date or number)
function WaterEditableCell({ value, type, rowClass, onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const ref = useRef(null);
  useEffect(()=>{if(editing)ref.current?.focus();},[editing]);
  const commit = async () => {
    setEditing(false);
    if (val===value||val==="") return;
    await onSave(val);
  };
  const cc=`border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-center text-[11px] whitespace-nowrap ${rowClass}`;
  if (editing) return (
    <td className={cc} style={{padding:0}}>
      <input ref={ref} type={type} value={val} onChange={e=>setVal(e.target.value)}
        onBlur={commit} onKeyDown={e=>{if(e.key==="Enter")commit();if(e.key==="Escape"){setEditing(false);setVal(value);}}}
        className="w-full px-2 py-1 text-[11px] text-center bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-400 outline-none"/>
    </td>
  );
  return (
    <td className={`${cc} cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:outline hover:outline-2 hover:outline-yellow-400`}
      onClick={()=>setEditing(true)} title="Click to edit">
      {type==="date"?fmt(value):value}
    </td>
  );
}

// ── Kitchen Stock Table (admin — inline edit all fields) ──────────────────────
function KitchenStockTable({ items, onUpdateItem }) {
  const tc = items.reduce((s,i)=>s+(i.current_quantity||0),0);
  const tp = items.reduce((s,i)=>s+(i.purchased_qty||0),0);
  // Total per row = Current Qty + Purchased ONLY if Purchased has a value
  // Grand total of Total column = sum of rows that have a Purchased value
  const tt = items.reduce((s,i)=> i.purchased_qty ? s+((i.current_quantity||0)+(i.purchased_qty||0)) : s, 0);

  const handleQtyChange = async (item, field, newVal) => {
    const current = field==="current_quantity" ? (newVal??0) : (item.current_quantity||0);
    const purchased = field==="purchased_qty" ? (newVal??0) : (item.purchased_qty||0);
    const total = purchased ? current + purchased : null;
    await onUpdateItem(item.id, { [field]: newVal??0, total_qty: total });
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-gray-400 dark:text-gray-500">
        Click any cell to edit. <span className="text-[#70AD47] font-medium">Total = Current Qty + Purchased (auto, only when Purchased is filled)</span>
      </p>
      <div className="overflow-x-auto rounded-xl border border-gray-300 dark:border-gray-700 shadow">
        <table className="border-collapse" style={{minWidth:"600px",fontSize:"11px"}}>
          <thead>
            <tr>
              <th className={`${TH} min-w-[36px]`}></th>
              <th className={`${TH} min-w-[180px] text-left`}>Item Name</th>
              <th className={`${TH} min-w-[100px]`} style={{borderLeft:"3px solid #70AD47"}}>Current Qty</th>
              <th className={`${TH} min-w-[100px]`}>Purchased</th>
              <th className={`${TH} min-w-[80px]`} style={{borderLeft:"3px solid #70AD47",borderRight:"3px solid #70AD47"}}>Total</th>
              <th className={`${TH} min-w-[120px]`}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item,idx)=>{
              const bg=idx%2===0?"bg-white dark:bg-[#1a2235]":"bg-gray-50 dark:bg-[#111827]";
              const c=`border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-center text-[11px] whitespace-nowrap ${bg} text-gray-800 dark:text-gray-100`;
              // Only show Total if Purchased has a value
              const autoTotal = item.purchased_qty ? (item.current_quantity||0)+(item.purchased_qty||0) : null;
              return(
                <tr key={item.id} className={bg}>
                  <td className={`${c} text-gray-500`}>{idx+1}</td>
                  <KitchenTextCell value={item.item_name} className={`${c} text-left font-medium`} onSave={v=>onUpdateItem(item.id,{item_name:v})}/>
                  <EditableCell value={item.current_quantity||null} className={`${c}`} style={{borderLeft:"2px solid #70AD47"}} onSave={v=>handleQtyChange(item,"current_quantity",v)}/>
                  <EditableCell value={item.purchased_qty||null} className={c} onSave={v=>handleQtyChange(item,"purchased_qty",v)}/>
                  {/* Total — auto-calculated, read-only */}
                  <td className={`border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-center text-[11px] whitespace-nowrap font-semibold ${bg} text-gray-800 dark:text-gray-100`}
                    style={{borderLeft:"2px solid #70AD47",borderRight:"2px solid #70AD47"}}>
                    {autoTotal ?? ""}
                  </td>
                  <KitchenTextCell value={item.notes||""} className={`${c} text-gray-500 dark:text-gray-400`} onSave={v=>onUpdateItem(item.id,{notes:v})}/>
                </tr>
              );
            })}
            {/* TOTAL row */}
            <tr className="bg-[#BDD7EE] dark:bg-[#1e3a5f] font-bold">
              <td className="border border-gray-400 dark:border-gray-600 px-2 py-2 text-center text-[11px]"></td>
              <td className="border border-gray-400 dark:border-gray-600 px-2 py-2 text-left text-[11px] font-bold text-gray-900 dark:text-white">TOTAL ITEMS IN INVENTORY</td>
              <td className="border border-gray-400 dark:border-gray-600 px-2 py-2 text-center text-[11px] font-bold text-gray-900 dark:text-white" style={{borderLeft:"2px solid #70AD47"}}>{tc}</td>
              <td className="border border-gray-400 dark:border-gray-600 px-2 py-2 text-center text-[11px] text-gray-900 dark:text-white"></td>
              <td className="border border-gray-400 dark:border-gray-600 px-2 py-2 text-center text-[11px] font-bold text-gray-900 dark:text-white" style={{borderLeft:"2px solid #70AD47",borderRight:"2px solid #70AD47"}}>{tt||""}</td>
              <td className="border border-gray-400 dark:border-gray-600 px-2 py-2"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Inline text cell for kitchen stock
function KitchenTextCell({ value, onSave, className }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value??"");
  const ref = useRef(null);
  useEffect(()=>{if(editing)ref.current?.focus();},[editing]);
  const commit = async () => {
    setEditing(false);
    if (val===(value??"")) return;
    await onSave(val);
  };
  if (editing) return (
    <td className={className} style={{padding:0}}>
      <input ref={ref} type="text" value={val} onChange={e=>setVal(e.target.value)}
        onBlur={commit} onKeyDown={e=>{if(e.key==="Enter")commit();if(e.key==="Escape"){setEditing(false);setVal(value??"");}}}
        className="w-full px-2 py-1 text-[11px] bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-400 outline-none"/>
    </td>
  );
  return (
    <td className={`${className} cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:outline hover:outline-2 hover:outline-yellow-400`}
      onClick={()=>setEditing(true)} title="Click to edit">
      {value||""}
    </td>
  );
}

// â”€â”€ Main CategoryDetails (Admin) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function CategoryDetails() {
  const { category } = useParams();
  const navigate = useNavigate();
  const cat = decodeURIComponent(category || "");

  const [loading, setLoading] = useState(true);
  const [monthly, setMonthly] = useState(null);
  const [water, setWater] = useState(null);
  const [stock, setStock] = useState([]);
  const [comments, setComments] = useState({});
  const [showPurchase, setShowPurchase] = useState(false);
  const [showWater, setShowWater] = useState(false);
  const [showAddRow, setShowAddRow] = useState(false);
  const [showAddCat, setShowAddCat] = useState(false);

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
        const [r, c] = await Promise.all([
          api.getMonthlyCategoryPurchases(cat),
          api.getCategoryComments(cat),
        ]);
        setMonthly({ items: r.items||[], months: r.months||[] });
        // Build comments map: { "2026-04-15": "some comment" }
        const cmap = {};
        (c.data||[]).forEach(row => { cmap[row.purchase_date] = row.comment; });
        setComments(cmap);
      }
    } catch(e) { console.error(e); toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  // Save comment to database
  const handleCommentSave = async (dateStr, comment) => {
    try {
      await api.saveComment(cat, dateStr, comment);
      setComments(p => ({ ...p, [dateStr]: comment }));
      toast.success("Comment saved");
    } catch(e) { toast.error(e.message || "Failed to save comment"); }
  };

  // Inline cell save
  const handleCellSave = async (itemId, dateStr, newValue) => {
    try {
      const res = await api.getPurchaseHistory(itemId);
      const existing = (res.data||[]).find(p => p.purchase_date === dateStr || p.purchase_date?.startsWith(dateStr));
      if (existing) {
        if (newValue === null || newValue === 0) {
          await api.deletePurchaseRecord(existing.id);
          toast.success("Cell cleared");
        } else {
          await api.updatePurchaseRecord(existing.id, { quantity: newValue, notes: existing.notes, purchase_date: dateStr });
          toast.success("Updated");
        }
      } else if (newValue !== null && newValue > 0) {
        await api.addPurchaseHistory(itemId, { quantity: newValue, purchase_date: dateStr, unit_price: 0, notes: "" });
        toast.success("Added");
      }
      load();
    } catch(e) { toast.error(e.message || "Failed to save"); }
  };

  // Delete entire row
  const handleDeleteRow = async (dateStr, items) => {
    if (!confirm(`Delete entire row for ${fmt(dateStr)}?`)) return;
    try {
      const deletePromises = [];
      for (const item of items) {
        const hist = await api.getPurchaseHistory(item.id);
        const record = (hist.data||[]).find(p => p.purchase_date === dateStr || p.purchase_date?.startsWith(dateStr));
        if (record) deletePromises.push(api.deletePurchaseRecord(record.id));
      }
      await Promise.all(deletePromises);
      toast.success(`Row ${fmt(dateStr)} deleted`);
      load();
    } catch(e) { toast.error(e.message || "Failed to delete row"); }
  };

  // Change date of a row
  const handleDateChange = async (oldDate, newDate, items) => {
    try {
      const updatePromises = [];
      for (const item of items) {
        const hist = await api.getPurchaseHistory(item.id);
        const record = (hist.data||[]).find(p => p.purchase_date === oldDate || p.purchase_date?.startsWith(oldDate));
        if (record) updatePromises.push(api.updatePurchaseRecord(record.id, { quantity: record.quantity, notes: record.notes, purchase_date: newDate }));
      }
      await Promise.all(updatePromises);
      toast.success("Date updated");
      load();
    } catch(e) { toast.error(e.message || "Failed to update date"); }
  };

  // Delete water delivery
  const handleDeleteDelivery = async (id) => {
    if (!confirm("Delete this delivery?")) return;
    try { await api.deleteWaterDelivery(id); toast.success("Deleted"); load(); }
    catch(e) { toast.error(e.message || "Failed"); }
  };

  // Edit water delivery inline
  const handleEditDelivery = async (id, payload) => {
    try { await api.updateWaterDelivery(id, payload); toast.success("Updated"); load(); }
    catch(e) { toast.error(e.message || "Failed to update"); }
  };

  // Update kitchen stock item field
  const handleUpdateStockItem = async (id, updates) => {
    try { await api.updateStockItem(id, updates); toast.success("Updated"); load(); }
    catch(e) { toast.error(e.message || "Failed to update"); }
  };

  const isMonthly = cat === "Kitchen Essentials" || cat === "Washroom Essentials" || cat === "Snacks" || cat === "Other Purchases";

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={()=>navigate("/dashboard/stock-management")} className="flex items-center gap-2 dark:border-gray-600 dark:text-gray-200">
            <ArrowLeft className="w-4 h-4"/> Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{cat}</h1>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              {cat==="Water Count"?"Delivery log â€” Sep 2025 to present":cat==="Kitchen Stock"?"Durable items inventory":"Monthly purchase log â€” Sep 2025 to present"}
            </p>
          </div>
        </div>
        {/* Add Category button â€” always visible */}
        <Button size="sm" onClick={()=>setShowAddCat(true)} className="flex items-center gap-1.5 bg-[#2E4057] hover:bg-[#1e2d3d] text-white text-xs">
          <Plus className="w-3.5 h-3.5"/> Add Category
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 text-sm">Loading...</div>
      ) : (
        <>
          {cat==="Water Count" && water && (
            <WaterTable months={water.months} stats={water.stats}
              onAdd={()=>setShowWater(true)}
              onDelete={handleDeleteDelivery}
              onEditDelivery={handleEditDelivery}/>
          )}
          {cat==="Kitchen Stock" && (
            <KitchenStockTable items={stock} onUpdateItem={handleUpdateStockItem}/>
          )}
          {isMonthly && monthly && (
            <MonthlyTable
              items={monthly.items} months={monthly.months}
              onAdd={()=>setShowPurchase(true)}
              onAddRow={()=>setShowAddRow(true)}
              onCellSave={handleCellSave}
              onDeleteRow={handleDeleteRow}
              onDateChange={handleDateChange}
              onCommentSave={handleCommentSave}
              comments={comments}/>
          )}
        </>
      )}

      {showPurchase && monthly && <AddPurchaseModal items={monthly.items} cat={cat} onClose={()=>setShowPurchase(false)} onSave={()=>{setShowPurchase(false);load();}}/>}
      {showWater && <AddWaterModal onClose={()=>setShowWater(false)} onSave={()=>{setShowWater(false);load();}}/>}
      {showAddRow && monthly && <AddRowModal items={monthly.items} onClose={()=>setShowAddRow(false)} onSave={()=>{setShowAddRow(false);load();}}/>}
      {showAddCat && <AddCategoryModal onClose={()=>setShowAddCat(false)} onSave={()=>{setShowAddCat(false);navigate("/dashboard/stock-management");}}/>}
    </div>
  );
}
