import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Plus, Trash2, PlusCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { api } from "../../services/api";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d) {
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yy = String(dt.getFullYear()).slice(2);
  return `${dd}/${mm}/${yy}`;
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

// ─── Style tokens ─────────────────────────────────────────────────────────────

const S_TH = "border border-gray-400 dark:border-gray-600 px-2 py-2 text-center text-[11px] font-bold whitespace-nowrap bg-[#2E4057] text-white";
const S_MONTH = "border border-gray-400 dark:border-gray-600 px-2 py-1 text-center text-[11px] font-bold bg-[#4472C4] text-white whitespace-nowrap";
const S_DATA = "border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-[11px] text-gray-800 dark:text-gray-100 whitespace-nowrap bg-white dark:bg-[#1a2235]";
const S_DATE = "border border-gray-300 dark:border-gray-600 px-2 py-1 text-left text-[11px] text-gray-800 dark:text-gray-100 whitespace-nowrap bg-white dark:bg-[#1a2235]";
const S_TOTAL = "border border-gray-400 dark:border-gray-600 px-2 py-1 text-center text-[11px] font-bold bg-[#BDD7EE] dark:bg-[#1e3a5f] text-gray-900 dark:text-white whitespace-nowrap";
const S_TOTAL_LABEL = "border border-gray-400 dark:border-gray-600 px-2 py-1 text-left text-[11px] font-bold bg-[#BDD7EE] dark:bg-[#1e3a5f] text-gray-900 dark:text-white whitespace-nowrap";
const S_TREND = "border border-gray-400 dark:border-gray-600 px-2 py-1 text-center text-[11px] font-bold bg-[#C00000] text-white whitespace-nowrap";
const S_TREND_LABEL = "border border-gray-400 dark:border-gray-600 px-2 py-1 text-left text-[11px] font-bold bg-[#C00000] text-white whitespace-nowrap";
const S_COMMENT = "border border-gray-300 dark:border-gray-600 px-2 py-1 text-[11px] text-gray-400 whitespace-nowrap bg-white dark:bg-[#1a2235]";

// ─── Add Purchase Modal ───────────────────────────────────────────────────────

function AddPurchaseModal({ items, onClose, onSave }) {
  const [date, setDate] = useState(todayISO());
  const [quantities, setQuantities] = useState({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const entries = Object.entries(quantities).filter(([, v]) => v && Number(v) > 0);
    if (!entries.length) { toast.error("Enter at least one quantity"); return; }
    setSaving(true);
    try {
      await Promise.all(
        entries.map(([itemId, qty]) =>
          api.addPurchaseHistory(itemId, { quantity: Number(qty), purchase_date: date, unit_price: 0, notes: "" })
        )
      );
      toast.success("Purchase recorded");
      onSave();
    } catch (e) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Add Purchase Entry</h2>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Purchase Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] text-gray-900 dark:text-white px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="text-xs text-gray-700 dark:text-gray-300 w-40 truncate">{item.item_name} ({item.unit})</span>
              <input type="number" min="0" placeholder="0"
                value={quantities[item.id] || ""}
                onChange={e => setQuantities(p => ({ ...p, [item.id]: e.target.value }))}
                className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] text-gray-900 dark:text-white px-2 py-1 text-sm text-center" />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="dark:border-gray-600 dark:text-gray-300">Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-[#D1131B] hover:bg-[#b01016] text-white">
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Water Delivery Modal ─────────────────────────────────────────────────

function AddWaterModal({ onClose, onSave }) {
  const [date, setDate] = useState(todayISO());
  const [bottles, setBottles] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!bottles || Number(bottles) <= 0) { toast.error("Enter number of bottles"); return; }
    setSaving(true);
    try {
      await api.addWaterDelivery({ delivery_date: date, bottles_delivered: Number(bottles), notes: "" });
      toast.success("Delivery recorded");
      onSave();
    } catch (e) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#1a2235] rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Add Water Delivery</h2>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Delivery Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] text-gray-900 dark:text-white px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Bottles Delivered</label>
          <input type="number" min="1" placeholder="0" value={bottles} onChange={e => setBottles(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#111827] text-gray-900 dark:text-white px-3 py-2 text-sm text-center" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="dark:border-gray-600 dark:text-gray-300">Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-[#4472C4] hover:bg-[#3560a8] text-white">
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Monthly Purchase Table (Admin — with Add Purchase button) ────────────────

function MonthlyPurchaseTable({ items, months, onAddPurchase }) {
  const totalCols = items.length + 3;
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={onAddPurchase}
          className="flex items-center gap-1.5 bg-[#D1131B] hover:bg-[#b01016] text-white text-xs">
          <Plus className="w-3.5 h-3.5" /> Add Purchase Entry
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-300 dark:border-gray-700 shadow-md">
        <table className="border-collapse text-[11px]" style={{ minWidth: "100%" }}>
          <thead>
            <tr>
              <th className={`${S_TH} min-w-[52px] sticky left-0 z-20 bg-[#2E4057]`}>Month</th>
              <th className={`${S_TH} min-w-[80px]`}>Date</th>
              {items.map(item => (
                <th key={item.id} className={`${S_TH} min-w-[90px]`}>
                  {item.item_name}{item.unit ? ` (${item.unit})` : ""}
                </th>
              ))}
              <th className={`${S_TH} min-w-[100px]`}>Comments</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month, mIdx) => {
              const dateKeys = Object.keys(month.dates).sort();
              const prevMonth = mIdx > 0 ? months[mIdx - 1] : null;
              const shortMonth = new Date(month.key + "-01").toLocaleString("en-GB", { month: "short" }).toUpperCase();
              const fullMonth = new Date(month.key + "-01").toLocaleString("en-GB", { month: "long" }).toUpperCase();
              const prevShort = prevMonth ? new Date(prevMonth.key + "-01").toLocaleString("en-GB", { month: "short" }).toUpperCase() : "";
              return (
                <>
                  {dateKeys.map((dateStr, dIdx) => (
                    <tr key={`${month.key}-${dateStr}`}>
                      {dIdx === 0 && (
                        <td rowSpan={dateKeys.length} className={`${S_MONTH} sticky left-0 z-10`}>{shortMonth}</td>
                      )}
                      <td className={S_DATE}>{fmtDate(dateStr)}</td>
                      {items.map(item => (
                        <td key={item.id} className={S_DATA}>
                          {month.dates[dateStr]?.[item.id] != null ? month.dates[dateStr][item.id] : ""}
                        </td>
                      ))}
                      <td className={S_COMMENT}></td>
                    </tr>
                  ))}
                  <tr key={`${month.key}-total`}>
                    <td className={`${S_TOTAL} sticky left-0 z-10`}>TOTAL</td>
                    <td className={S_TOTAL_LABEL}>{fullMonth}</td>
                    {items.map(item => <td key={item.id} className={S_TOTAL}>{month.totals[item.id] ?? 0}</td>)}
                    <td className={S_TOTAL}></td>
                  </tr>
                  {prevMonth && (
                    <tr key={`${month.key}-trend`}>
                      <td className={`${S_TREND} sticky left-0 z-10`}>TREND</td>
                      <td className={S_TREND_LABEL}>vs {prevShort}</td>
                      {items.map(item => {
                        const val = month.trends[item.id] ?? 0;
                        return <td key={item.id} className={S_TREND}>{val > 0 ? `+${val}` : val}</td>;
                      })}
                      <td className={S_TREND}></td>
                    </tr>
                  )}
                  <tr key={`${month.key}-spacer`}>
                    <td colSpan={totalCols} className="h-3 bg-gray-100 dark:bg-[#111827] border-0"></td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Water Count Table (Admin — with Add Delivery button + delete) ────────────

function WaterCountTable({ months, stats, onAddDelivery, onDeleteDelivery }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Grand Total", value: `${stats.grand_total} bottles` },
          { label: "Total Deliveries", value: stats.total_deliveries },
          { label: "Avg / Delivery", value: `${stats.average_per_delivery} bottles` },
          { label: "Max Delivery", value: `${stats.max_delivery} bottles` },
          { label: "Min Delivery", value: `${stats.min_delivery} bottles` },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2235] p-3 text-center shadow-sm">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-base font-bold text-[#2E4057] dark:text-blue-300">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button size="sm" onClick={onAddDelivery}
          className="flex items-center gap-1.5 bg-[#4472C4] hover:bg-[#3560a8] text-white text-xs">
          <PlusCircle className="w-3.5 h-3.5" /> Add Delivery
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-300 dark:border-gray-700 shadow-md">
        <table className="border-collapse text-[11px]" style={{ minWidth: "480px" }}>
          <thead>
            <tr>
              <th className={`${S_TH} min-w-[140px]`}>Delivery Date</th>
              <th className={`${S_TH} min-w-[150px]`}>Bottles Delivered</th>
              <th className={`${S_TH} min-w-[140px]`}>Total in Month</th>
              <th className={`${S_TH} min-w-[60px]`}></th>
            </tr>
            <tr>
              <th className={`${S_TH} text-[10px] tracking-wide`}>DELIVERY DATE</th>
              <th className={`${S_TH} text-[10px] tracking-wide`}>BOTTLES DELIVERED</th>
              <th className={`${S_TH} text-[10px] tracking-wide`}>TOTAL IN MONTHS</th>
              <th className={`${S_TH} text-[10px]`}>DEL</th>
            </tr>
          </thead>
          <tbody>
            {months.map(month => (
              <>
                {month.deliveries.map((d, idx) => {
                  const isLast = idx === month.deliveries.length - 1;
                  const rowCls = isLast ? "bg-[#BDD7EE] dark:bg-[#1e3a5f] font-bold text-gray-900 dark:text-white" : "bg-white dark:bg-[#1a2235] text-gray-800 dark:text-gray-100";
                  const cellCls = `border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-center text-[11px] whitespace-nowrap ${rowCls}`;
                  return (
                    <tr key={d.id} className={rowCls}>
                      <td className={cellCls}>{fmtDate(d.delivery_date)}</td>
                      <td className={cellCls}>{d.bottles_delivered}</td>
                      <td className={cellCls}>{isLast ? month.total : ""}</td>
                      <td className={`border border-gray-300 dark:border-gray-600 px-2 py-1 text-center ${rowCls}`}>
                        <button onClick={() => onDeleteDelivery(d.id)}
                          className="text-red-500 hover:text-red-700 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                <tr key={`${month.label}-spacer`}>
                  <td colSpan={4} className="h-3 bg-gray-100 dark:bg-[#111827] border-0"></td>
                </tr>
              </>
            ))}
            <tr className="bg-[#2E4057] text-white font-bold">
              <td className="border border-gray-400 px-3 py-2 text-center text-[11px]">GRAND TOTAL</td>
              <td className="border border-gray-400 px-3 py-2 text-center text-[11px]">{stats.grand_total}</td>
              <td className="border border-gray-400 px-3 py-2 text-center text-[11px]">{stats.grand_total}</td>
              <td className="border border-gray-400 px-3 py-2"></td>
            </tr>
            {[
              { label: "Average per delivery", value: stats.average_per_delivery },
              { label: "Max delivery", value: stats.max_delivery },
              { label: "Min delivery", value: stats.min_delivery },
              { label: "Total deliveries", value: stats.total_deliveries },
            ].map(row => (
              <tr key={row.label} className="bg-white dark:bg-[#1a2235]">
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-1 text-left text-[11px] text-gray-700 dark:text-gray-300 font-medium">{row.label}</td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-1 text-center text-[11px] font-bold text-gray-800 dark:text-white">{row.value}</td>
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

// ─── Kitchen Stock Table (Admin — read-only, inventory snapshot) ──────────────

function KitchenStockTable({ items }) {
  const totalCurrent = items.reduce((s, i) => s + (i.current_quantity || 0), 0);
  const totalPurchased = items.reduce((s, i) => s + (i.purchased_qty || 0), 0);
  const totalAll = items.reduce((s, i) => s + (i.total_qty || 0), 0);
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 dark:border-gray-700 shadow-md">
      <table className="border-collapse text-[11px]" style={{ minWidth: "600px" }}>
        <thead>
          <tr>
            <th className={`${S_TH} min-w-[36px]`}></th>
            <th className={`${S_TH} min-w-[180px] text-left`}>Item Name</th>
            <th className={`${S_TH} min-w-[110px]`}>Current Qty</th>
            <th className={`${S_TH} min-w-[110px]`}>Purchased</th>
            <th className={`${S_TH} min-w-[80px]`}>Total</th>
            <th className={`${S_TH} min-w-[130px]`}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const rowBg = idx % 2 === 0 ? "bg-white dark:bg-[#1a2235]" : "bg-gray-50 dark:bg-[#111827]";
            const cell = `border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-center text-[11px] whitespace-nowrap ${rowBg} text-gray-800 dark:text-gray-100`;
            return (
              <tr key={item.id} className={rowBg}>
                <td className={`${cell} text-gray-500`}>{idx + 1}</td>
                <td className={`${cell} text-left font-medium`}>{item.item_name}</td>
                <td className={cell}>{item.current_quantity || ""}</td>
                <td className={cell}>{item.purchased_qty || ""}</td>
                <td className={cell}>{item.total_qty || ""}</td>
                <td className={`${cell} text-gray-500 dark:text-gray-400`}>{item.notes || ""}</td>
              </tr>
            );
          })}
          <tr className="bg-[#BDD7EE] dark:bg-[#1e3a5f] font-bold">
            <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[11px]"></td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-left text-[11px] font-bold text-gray-900 dark:text-white">TOTAL ITEMS IN INVENTORY</td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[11px] font-bold text-gray-900 dark:text-white">{totalCurrent}</td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[11px] font-bold text-gray-900 dark:text-white">{totalPurchased || ""}</td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[11px] font-bold text-gray-900 dark:text-white">{totalAll || ""}</td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Main (Admin) ─────────────────────────────────────────────────────────────

export function CategoryDetails() {
  const { category } = useParams();
  const navigate = useNavigate();
  const cat = decodeURIComponent(category || "");

  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState(null);
  const [waterData, setWaterData] = useState(null);
  const [kitchenStockItems, setKitchenStockItems] = useState([]);
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [showAddWater, setShowAddWater] = useState(false);

  useEffect(() => { if (cat) load(); }, [cat]);

  const load = async () => {
    setLoading(true);
    try {
      if (cat === "Water Count") {
        const res = await api.getWaterDeliveries();
        setWaterData({ months: res.months || [], stats: res.stats || {} });
      } else if (cat === "Kitchen Stock") {
        const res = await api.getMonthlyCategoryPurchases(cat);
        setKitchenStockItems(res.items || []);
      } else {
        const res = await api.getMonthlyCategoryPurchases(cat);
        setMonthlyData({ items: res.items || [], months: res.months || [] });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDelivery = async (id) => {
    if (!confirm("Delete this delivery record?")) return;
    try {
      await api.deleteWaterDelivery(id);
      toast.success("Delivery deleted");
      load();
    } catch (e) {
      toast.error(e.message || "Failed to delete");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate("/stock-management")}
          className="flex items-center gap-2 dark:border-gray-600 dark:text-gray-200">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{cat}</h1>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            {cat === "Water Count" ? "Delivery log — Sep 2025 to present"
              : cat === "Kitchen Stock" ? "Durable items inventory"
              : "Monthly purchase log — Sep 2025 to present"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 text-sm">Loading...</div>
      ) : (
        <>
          {cat === "Water Count" && waterData && (
            <WaterCountTable
              months={waterData.months}
              stats={waterData.stats}
              onAddDelivery={() => setShowAddWater(true)}
              onDeleteDelivery={handleDeleteDelivery}
            />
          )}
          {cat === "Kitchen Stock" && <KitchenStockTable items={kitchenStockItems} />}
          {(cat === "Kitchen Essentials" || cat === "Washroom Essentials" || cat === "Snacks" || cat === "Other Purchases") && monthlyData && (
            <MonthlyPurchaseTable
              items={monthlyData.items}
              months={monthlyData.months}
              onAddPurchase={() => setShowAddPurchase(true)}
            />
          )}
        </>
      )}

      {showAddPurchase && monthlyData && (
        <AddPurchaseModal
          items={monthlyData.items}
          onClose={() => setShowAddPurchase(false)}
          onSave={() => { setShowAddPurchase(false); load(); }}
        />
      )}

      {showAddWater && (
        <AddWaterModal
          onClose={() => setShowAddWater(false)}
          onSave={() => { setShowAddWater(false); load(); }}
        />
      )}
    </div>
  );
}