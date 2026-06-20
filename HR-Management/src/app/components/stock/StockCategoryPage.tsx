import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { api } from "../../../services/api";
import { toast } from "sonner";
import {
  DetailHeader,
  MonthTabs,
  RegisterMonthTable,
  KitchenStockRegisterTable,
  EditableQtyCell,
  entryPayloadForUpsert,
  EntryField,
  REG,
  SavingOverlay,
} from "./StockRegisterUI";
import React from "react";

function WaterCountTable({ readOnly, onBack }: { readOnly: boolean; onBack: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    setLoading(true);
    api.getWaterDeliveries().then(setData).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="flex justify-center p-16"><div className="animate-spin h-8 w-8 border-b-2 border-[#D1131B]" /></div>;

  const { months = [], stats = {} } = data || {};

  const handleUpdate = async (id: string, updates: any) => {
    try {
      setSaving(true);
      await api.updateWaterDelivery(id, updates);
      const newData = await api.getWaterDeliveries();
      setData(newData);
      toast.success("Delivery updated");
    } catch(err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this delivery?")) return;
    try {
      setSaving(true);
      await api.deleteWaterDelivery(id);
      const newData = await api.getWaterDeliveries();
      setData(newData);
      toast.success("Delivery deleted");
    } catch(err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    const dStr = prompt("Enter delivery date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
    if (!dStr) return;
    const bStr = prompt("Enter bottles delivered:");
    if (!bStr) return;
    const b = parseInt(bStr, 10);
    if (isNaN(b) || b <= 0) return toast.error("Invalid bottles amount");
    
    try {
      setSaving(true);
      await api.addWaterDelivery({ delivery_date: dStr, bottles_delivered: b });
      const newData = await api.getWaterDeliveries();
      setData(newData);
      toast.success("Delivery added");
    } catch(err: any) {
      toast.error(err.message || "Failed to add delivery");
    } finally {
      setSaving(false);
    }
  };

  const getMonthColors = (monthLabel: string) => {
    const l = monthLabel.toLowerCase();
    if (l.includes('sep')) return { bg: 'bg-[#d9e1f2] dark:bg-blue-900/20', text: 'text-[#29487d] dark:text-blue-300' };
    if (l.includes('oct')) return { bg: 'bg-[#e2efda] dark:bg-emerald-900/20', text: 'text-[#385723] dark:text-emerald-400' };
    if (l.includes('nov')) return { bg: 'bg-[#fce4d6] dark:bg-orange-900/20', text: 'text-[#c65911] dark:text-orange-400' };
    if (l.includes('dec')) return { bg: 'bg-[#fff2cc] dark:bg-amber-900/20', text: 'text-[#bf8f00] dark:text-amber-400' };
    if (l.includes('jan')) return { bg: 'bg-[#bdd7ee] dark:bg-blue-900/30', text: 'text-[#1f4e78] dark:text-blue-200' };
    if (l.includes('feb')) return { bg: 'bg-[#e0eaf5] dark:bg-indigo-900/20', text: 'text-[#305496] dark:text-indigo-300' };
    if (l.includes('mar')) return { bg: 'bg-[#e2efda] dark:bg-emerald-900/20', text: 'text-[#385723] dark:text-emerald-400' };
    if (l.includes('apr')) return { bg: 'bg-[#e0eaf5] dark:bg-indigo-900/20', text: 'text-[#305496] dark:text-indigo-300' };
    return { bg: 'bg-[#f2f2f2] dark:bg-gray-800', text: 'text-[#595959] dark:text-gray-300' };
  };

  let globalIndex = 1;

  return (
    <div className="flex flex-col min-h-0 pb-4 relative">
      <SavingOverlay show={saving} />
      <DetailHeader 
        title="Water Count" 
        subtitle={readOnly ? "Dispenser bottle delivery log · Read-only" : "Dispenser bottle delivery log"} 
        onBack={onBack}
        onAdd={readOnly ? undefined : handleAdd}
        addLabel="+ Add Delivery"
      />
      
      {!readOnly && (
        <p className="px-6 text-[11px] text-gray-500">
          Click on a bottles number to edit it. To delete, hover over the row index number (#) and click the ✕.
        </p>
      )}

      <div className="overflow-x-auto px-4 sm:px-6 pb-8 pt-4">
        <div className="max-w-4xl mx-auto overflow-hidden bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm rounded-lg">
          <table className="w-full border-collapse text-sm text-center font-sans">
            <thead>
              <tr className="bg-[#29487d] dark:bg-gray-700 text-white">
                <th className="py-2.5 px-2 border border-gray-300 dark:border-gray-600 font-bold w-12 text-lg">#</th>
                <th className="py-2.5 px-4 border border-gray-300 dark:border-gray-600 font-bold text-lg">Delivery Date</th>
                <th className="py-2.5 px-4 border border-gray-300 dark:border-gray-600 font-bold text-lg">Bottles Delivered</th>
                <th className="py-2.5 px-4 border border-gray-300 dark:border-gray-600 font-bold text-lg w-32">Month Total</th>
              </tr>
            </thead>
            <tbody>
              {months.map((m: any) => {
                const monthName = m.label.split(' ')[0];
                const niceMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();
                const { bg, text } = getMonthColors(niceMonthName);
                
                return (
                  <React.Fragment key={m.label}>
                    {m.deliveries?.map((d: any, i: number) => {
                      const isLast = i === m.deliveries.length - 1;
                      return (
                        <tr key={d.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-2 px-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium relative group">
                            {globalIndex++}
                            {!readOnly && (
                              <button 
                                onClick={() => handleDelete(d.id)} 
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-white hover:bg-red-500 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-full w-5 h-5 flex items-center justify-center text-[10px] transition-all shadow-sm" 
                                title="Delete"
                              >✕</button>
                            )}
                          </td>
                          <td className="py-2 px-4 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-medium">
                            {new Date(d.delivery_date).toLocaleDateString("en-GB")}
                          </td>
                          <EditableQtyCell
                            value={d.bottles_delivered}
                            editable={!readOnly}
                            onSave={(v) => handleUpdate(d.id, { bottles_delivered: v })}
                            className="py-2 px-4 border border-gray-300 dark:border-gray-700 text-[#29487d] dark:text-blue-400 font-bold text-base bg-white dark:bg-gray-800"
                          />
                          <td className={`py-2 px-4 border border-gray-300 dark:border-gray-700 font-bold text-base ${isLast ? `${bg} ${text}` : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'}`}>
                            {isLast ? m.total : ""}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className={`${bg}`}>
                      <td colSpan={2} className={`py-2 px-4 border border-gray-300 dark:border-gray-700 font-bold text-left ${text} text-base`}>
                        &nbsp;&nbsp;{niceMonthName} TOTAL <span className="font-normal mx-1 opacity-70">→</span> {m.total} bottles
                      </td>
                      <td className="py-2 px-4 border border-gray-300 dark:border-gray-700"></td>
                      <td className={`py-2 px-4 border border-gray-300 dark:border-gray-700 font-bold text-base ${text}`}>{m.total}</td>
                    </tr>
                  </React.Fragment>
                );
              })}
              <tr className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
                <td colSpan={2} className="py-3 px-4 border border-gray-300 dark:border-gray-700 font-extrabold text-left tracking-wider text-base pl-6 uppercase text-[#D1131B] dark:text-red-400">GRAND TOTAL</td>
                <td className="py-3 px-4 border border-gray-300 dark:border-gray-700"></td>
                <td className="py-3 px-4 border border-gray-300 dark:border-gray-700 font-extrabold text-xl text-[#D1131B] dark:text-red-400">{stats.grand_total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function StockCategoryPage({ readOnly = false, listPath }: { readOnly?: boolean; listPath: string }) {
  const { category } = useParams();
  const navigate = useNavigate();
  const decodedCategory = decodeURIComponent(category || "");
  const back = () => navigate(listPath);

  const [items, setItems] = useState<any[]>([]);
  const [months, setMonths] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeMonthId, setActiveMonthId] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (decodedCategory === "Kitchen Stock") {
          const res = await api.getStockByCategory(decodedCategory);
          setItems(res.data || []);
        } else if (decodedCategory !== "Water Count") {
          const res = await api.getCategoryEntries(decodedCategory);
          setItems(res.items || []);
          setMonths(res.months || []);
          setEntries(res.entries || []);
          const m = res.months || [];
          if (m.length) setActiveMonthId(m[m.length - 1].id);
        }
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [decodedCategory]);

  const entryMap = useMemo(() => {
    const map: Record<string, Record<string, any>> = {};
    entries.forEach((e) => {
      if (!map[e.stock_item_id]) map[e.stock_item_id] = {};
      map[e.stock_item_id][e.month_id] = { ...e };
    });

    items.forEach((item) => {
      let prevClosing: number | undefined = undefined;
      months.forEach((month) => {
        let e = map[item.id]?.[month.id];
        if (!e) {
          e = {
            stock_item_id: item.id,
            month_id: month.id,
            p1_opening: 0, p1_bought: 0, p1_used: 0, p1_closing: 0,
            p2_opening: 0, p2_bought: 0, p2_used: 0, p2_closing: 0,
            total_bought: 0, total_used: 0, stock_movement: 0, final_closing: 0
          };
          if (!map[item.id]) map[item.id] = {};
          map[item.id][month.id] = e;
        }

        // APPROACH B: Historical months (Sep 2025 – Apr 2026) display the exact
        // values from the database, which match the original Excel file perfectly.
        // Cascading carry-over is only applied from May 2026 onwards, seeding
        // from April 2026's final closing stock.
        const monthKey = (month.month_key as string) || "";
        const shouldCascade = monthKey >= "2026-05" && prevClosing !== undefined;

        if (shouldCascade) {
          e.p1_opening = prevClosing;
          const p1o = Number(e.p1_opening) || 0;
          const p1b = Number(e.p1_bought) || 0;
          const p1u = Number(e.p1_used) || 0;
          e.p1_closing = p1o + p1b - p1u;

          e.p2_opening = Number(e.p1_closing) || 0;
          const p2o = Number(e.p2_opening) || 0;
          const p2b = Number(e.p2_bought) || 0;
          const p2u = Number(e.p2_used) || 0;
          e.p2_closing = p2o + p2b - p2u;

          e.total_bought = p1b + p2b;
          e.total_used = p1u + p2u;
          e.stock_movement = e.total_bought - e.total_used;
          e.final_closing = Number(e.p2_closing) || Number(e.p1_closing) || 0;
        }
        // Always track prevClosing so May 2026 can seed from April 2026's real value
        prevClosing = Number(e.final_closing) || 0;
      });
    });

    return map;
  }, [entries, items, months]);

  const getEntry = (itemId: string, monthId: string) => entryMap[itemId]?.[monthId];

  const handleCellSave = async (itemId: string, monthId: string, field: EntryField, newValue: number) => {
    if (readOnly) return;
    const existing = getEntry(itemId, monthId);
    const base = existing ? { ...existing } : {};
    const payload = entryPayloadForUpsert(itemId, monthId, { ...base, [field]: newValue }, field);
    try {
      setSaving(true);
      const res = await api.upsertStockEntry(payload);
      const saved = res.data;
      setEntries((prev) => {
        const idx = prev.findIndex((e) => e.stock_item_id === itemId && e.month_id === monthId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...saved };
          return next;
        }
        return [...prev, saved];
      });
      const latestMonth = months.length ? months[months.length - 1] : null;
      if (latestMonth?.id === monthId && saved?.final_closing != null) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === itemId ? { ...it, current_quantity: saved.final_closing } : it
          )
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D1131B]" />
      </div>
    );
  }

  if (decodedCategory === "Water Count") return <WaterCountTable readOnly={readOnly} onBack={back} />;

  if (decodedCategory === "Kitchen Stock") {
    return (
      <div>
        <DetailHeader
          title="Kitchen Stock"
          subtitle={readOnly ? "Equipment register · Read-only" : "Equipment register"}
          onBack={back}
          onAdd={
            readOnly
              ? undefined
              : async () => {
                  const name = prompt("Item name:")?.trim();
                  if (!name) return;
                  const unit = prompt("Unit (e.g. pcs, pkts):", "pcs")?.trim() || "pcs";
                  try {
                    setSaving(true);
                    const res = await api.createStockItem({
                      category: "Kitchen Stock",
                      item_name: name,
                      unit,
                      is_durable: true,
                    });
                    setItems((p) => [...p, res.data]);
                    toast.success(`Added "${name}"`);
                  } catch (err: any) {
                    toast.error(err.message || "Failed to add item");
                  } finally {
                    setSaving(false);
                  }
                }
          }
        />
        <KitchenStockRegisterTable
          items={items}
          editable={!readOnly}
          onUpdate={
            readOnly
              ? undefined
              : async (id, u) => {
                  try {
                    setSaving(true);
                    const item = items.find((i) => i.id === id);
                    const merged = { ...item, ...u };
                    const total_qty =
                      (merged.current_quantity || 0) +
                      (merged.purchased_qty || 0) -
                      (merged.broken_lost_qty || 0);
                    const res = await api.updateStockItem(id, { ...u, total_qty });
                    const saved = res.data;
                    setItems((p) => p.map((it) => (it.id === id ? { ...it, ...saved } : it)));
                  } catch (err: any) {
                    toast.error(err.message || "Failed to save");
                  } finally {
                    setSaving(false);
                  }
                }
          }
        />
      </div>
    );
  }

  const activeMonth = months.find((m) => m.id === activeMonthId) || months[months.length - 1];

  return (
    <div className="flex flex-col min-h-0 pb-4">
      <DetailHeader
        title={decodedCategory}
        subtitle={readOnly ? "Stock Management Register · Read-only" : "Stock Management Register"}
        onBack={back}
        onAdd={readOnly ? undefined : async () => {
          const name = prompt("Item name:")?.trim();
          if (!name) return;
          const unit = prompt("Unit (e.g. pkts, kg, pcs):", "pkts")?.trim() || "pkts";
          try {
            setSaving(true);
            const res = await api.createStockItem({
              category: decodedCategory,
              item_name: name,
              unit,
              is_durable: false,
            });
            setItems((p) => [...p, res.data]);
            toast.success(`Added "${name}"`);
          } catch (err: any) {
            toast.error(err.message || "Failed to add item");
          } finally {
            setSaving(false);
          }
        }}
      />
      {months.length > 0 && (
        <MonthTabs
          months={months}
          activeId={activeMonth?.id || ""}
          onChange={setActiveMonthId}
          onAddMonth={
            readOnly
              ? undefined
              : async () => {
                  const lastMonth = months[months.length - 1];
                  if (!lastMonth) return;
                  
                  const [yearStr, monthStr] = lastMonth.month_key.split('-');
                  let year = parseInt(yearStr, 10);
                  let month = parseInt(monthStr, 10);
                  month += 1;
                  if (month > 12) {
                    month = 1;
                    year += 1;
                  }
                  
                  const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
                  const dateObj = new Date(year, month - 1, 1);
                  const monthLabelLong = dateObj.toLocaleString('en-US', { month: 'long' }) + " " + year;
                  const monthLabelShort = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase() + " " + year.toString().slice(-2);
                  
                  if (!window.confirm(`Create new empty template for ${monthLabelLong}?`)) return;
                  
                  const short = dateObj.toLocaleString('en-US', { month: 'short' });
                  const p1 = `${short} 01-15`;
                  const p2 = `${short} 16-31`;
                  const sort_order = year * 100 + month;
                  
                  try {
                    setSaving(true);
                    const res = await api.addStockMonthTemplate({
                      category: decodedCategory,
                      month_key: monthKey,
                      month_label: monthLabelShort,
                      period_1_label: p1,
                      period_2_label: p2,
                      sort_order
                    });
                    
                    const refreshRes = await api.getCategoryEntries(decodedCategory);
                    setItems(refreshRes.items || []);
                    setMonths(refreshRes.months || []);
                    setEntries(refreshRes.entries || []);
                    setActiveMonthId(res.data.id);
                    toast.success(`Template for ${monthLabelLong} added successfully!`);
                  } catch (err: any) {
                    toast.error(err.message || "Failed to add month");
                  } finally {
                    setSaving(false);
                  }
                }
          }
        />
      )}
      <div className="px-4 sm:px-6 pb-8">
        {activeMonth && (
          <RegisterMonthTable
            month={activeMonth}
            isFirstMonth={months.length > 0 && months[0].id === activeMonth.id}
            categoryLabel={decodedCategory}
            items={items}
            entryMap={entryMap}
            editable={!readOnly}
            onCellSave={handleCellSave}
          />
        )}
      </div>
      <SavingOverlay show={saving} />
      {readOnly && <p className="px-6 pb-6 text-[11px] text-gray-400">Read-only view</p>}
    </div>
  );
}
