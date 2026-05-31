import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { api } from "../../../services/api";
import { toast } from "sonner";
import {
  DetailHeader,
  MonthTabs,
  RegisterMonthTable,
  KitchenStockRegisterTable,
  SavingOverlay,
  entryPayloadForUpsert,
  EntryField,
  REG,
} from "./StockRegisterUI";

function WaterCountReadonly({ onBack }: { onBack: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getWaterDeliveries().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-16"><div className="animate-spin h-8 w-8 border-b-2 border-[#D1131B]" /></div>;

  const { months = [], stats = {} } = data || {};

  return (
    <div className="flex flex-col min-h-0 pb-4">
      <DetailHeader title="Water Count" subtitle="Dispenser bottle delivery log" onBack={onBack} />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 px-4 sm:px-6 py-4">
        {[
          { label: "Total Bottles", value: stats.grand_total || 0 },
          { label: "Deliveries", value: stats.total_deliveries || 0 },
          { label: "Avg/Delivery", value: stats.average_per_delivery || 0 },
          { label: "Max", value: stats.max_delivery || 0 },
          { label: "Min", value: stats.min_delivery || 0 },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-center shadow-sm">
            <p className="text-[11px] uppercase text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className="text-xl font-bold text-[#D1131B]">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto px-4 sm:px-6 pb-8">
        <table className="w-full border-collapse min-w-[500px] text-xs">
          <thead>
            <tr>
              <th className={REG.subHdr}>Month</th>
              <th className={REG.subHdr}>Date</th>
              <th className={REG.subHdr}>Bottles</th>
              <th className={REG.subHdr}>Total</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m: any) => (
              <tbody key={m.label}>
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-sm font-bold uppercase bg-[#4a90e2] text-white">{m.label}</td>
                </tr>
                {m.deliveries?.map((d: any, i: number) => (
                  <tr key={d.id}>
                    <td className={REG.data} />
                    <td className={REG.data}>{new Date(d.delivery_date).toLocaleDateString("en-GB")}</td>
                    <td className={REG.data}>{d.bottles_delivered}</td>
                    <td className={REG.data}>{i === m.deliveries.length - 1 ? m.total : ""}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </tbody>
        </table>
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
      map[e.stock_item_id][e.month_id] = e;
    });
    return map;
  }, [entries]);

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

  if (decodedCategory === "Water Count") return <WaterCountReadonly onBack={back} />;

  if (decodedCategory === "Kitchen Stock") {
    return (
      <div>
        <DetailHeader
          title="Kitchen Stock"
          subtitle={readOnly ? "Equipment register · Read-only" : "Equipment register"}
          onBack={back}
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
      {months.length > 0 && <MonthTabs months={months} activeId={activeMonth?.id || ""} onChange={setActiveMonthId} />}
      <div className="px-4 sm:px-6 pb-8">
        {activeMonth && (
          <RegisterMonthTable
            month={activeMonth}
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
