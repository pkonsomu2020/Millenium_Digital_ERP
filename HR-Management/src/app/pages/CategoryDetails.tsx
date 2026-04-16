import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { api } from "../../services/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yy = String(dt.getFullYear()).slice(2);
  return `${dd}/${mm}/${yy}`;
}

// ─── Shared style tokens ──────────────────────────────────────────────────────

// Header row — dark blue
const S_TH = "border border-gray-400 dark:border-gray-600 px-2 py-2 text-center text-[11px] font-bold whitespace-nowrap bg-[#2E4057] text-white";
// Month label cell — medium blue, bold
const S_MONTH = "border border-gray-400 dark:border-gray-600 px-2 py-1 text-center text-[11px] font-bold bg-[#4472C4] text-white whitespace-nowrap";
// Normal data row
const S_DATA = "border border-gray-300 dark:border-gray-600 px-2 py-1 text-center text-[11px] text-gray-800 dark:text-gray-100 whitespace-nowrap bg-white dark:bg-[#1a2235]";
// Date cell in data row (left-aligned)
const S_DATE = "border border-gray-300 dark:border-gray-600 px-2 py-1 text-left text-[11px] text-gray-800 dark:text-gray-100 whitespace-nowrap bg-white dark:bg-[#1a2235]";
// TOTAL row — light blue
const S_TOTAL = "border border-gray-400 dark:border-gray-600 px-2 py-1 text-center text-[11px] font-bold bg-[#BDD7EE] dark:bg-[#1e3a5f] text-gray-900 dark:text-white whitespace-nowrap";
const S_TOTAL_LABEL = "border border-gray-400 dark:border-gray-600 px-2 py-1 text-left text-[11px] font-bold bg-[#BDD7EE] dark:bg-[#1e3a5f] text-gray-900 dark:text-white whitespace-nowrap";
// TREND row — red
const S_TREND = "border border-gray-400 dark:border-gray-600 px-2 py-1 text-center text-[11px] font-bold bg-[#C00000] text-white whitespace-nowrap";
const S_TREND_LABEL = "border border-gray-400 dark:border-gray-600 px-2 py-1 text-left text-[11px] font-bold bg-[#C00000] text-white whitespace-nowrap";
// Comments cell
const S_COMMENT = "border border-gray-300 dark:border-gray-600 px-2 py-1 text-[11px] text-gray-400 whitespace-nowrap bg-white dark:bg-[#1a2235]";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StockItem {
  id: string;
  item_name: string;
  unit: string;
  current_quantity: number;
  purchased_qty?: number;
  total_qty?: number;
  notes?: string;
}

interface MonthGroup {
  key: string;
  label: string;
  dates: Record<string, Record<string, number>>;
  totals: Record<string, number>;
  trends: Record<string, number>;
}

interface WaterDelivery {
  id: string;
  delivery_date: string;
  bottles_delivered: number;
}

interface WaterMonth {
  label: string;
  deliveries: WaterDelivery[];
  total: number;
}

interface WaterStats {
  grand_total: number;
  total_deliveries: number;
  average_per_delivery: number;
  max_delivery: number;
  min_delivery: number;
}

// ─── Kitchen Essentials / Washroom Essentials / Snacks ────────────────────────
// Layout: Month(rowspan) | Date | item cols... | Comments
// After each month: TOTAL row (light blue), TREND row (red, skip first month), spacer

function MonthlyPurchaseTable({ items, months }: { items: StockItem[]; months: MonthGroup[] }) {
  const totalCols = items.length + 3; // Month + Date + items + Comments

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 dark:border-gray-700 shadow-md">
      <table className="border-collapse text-[11px]" style={{ minWidth: "100%" }}>
        <thead>
          <tr>
            <th className={`${S_TH} min-w-[52px] sticky left-0 z-20 bg-[#2E4057]`}>Month</th>
            <th className={`${S_TH} min-w-[80px]`}>Date</th>
            {items.map((item) => (
              <th key={item.id} className={`${S_TH} min-w-[90px]`}>
                {item.item_name}
                {item.unit ? `\n(${item.unit})` : ""}
              </th>
            ))}
            <th className={`${S_TH} min-w-[100px]`}>Comments</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month, mIdx) => {
            const dateKeys = Object.keys(month.dates).sort();
            const prevMonth = mIdx > 0 ? months[mIdx - 1] : null;
            // short month name e.g. "SEP", "OCT"
            const shortMonth = new Date(month.key + "-01")
              .toLocaleString("en-GB", { month: "short" })
              .toUpperCase();
            // full month name for TOTAL row e.g. "SEPTEMBER"
            const fullMonth = new Date(month.key + "-01")
              .toLocaleString("en-GB", { month: "long" })
              .toUpperCase();
            const prevShort = prevMonth
              ? new Date(prevMonth.key + "-01")
                  .toLocaleString("en-GB", { month: "short" })
                  .toUpperCase()
              : "";

            return (
              <>
                {/* Data rows */}
                {dateKeys.map((dateStr, dIdx) => (
                  <tr key={`${month.key}-${dateStr}`}>
                    {/* Month cell — only on first data row, rowspan = number of date rows */}
                    {dIdx === 0 && (
                      <td
                        rowSpan={dateKeys.length}
                        className={`${S_MONTH} sticky left-0 z-10`}
                      >
                        {shortMonth}
                      </td>
                    )}
                    <td className={S_DATE}>{fmtDate(dateStr)}</td>
                    {items.map((item) => (
                      <td key={item.id} className={S_DATA}>
                        {month.dates[dateStr]?.[item.id] != null
                          ? month.dates[dateStr][item.id]
                          : ""}
                      </td>
                    ))}
                    <td className={S_COMMENT}></td>
                  </tr>
                ))}

                {/* TOTAL row */}
                <tr key={`${month.key}-total`}>
                  <td className={`${S_TOTAL} sticky left-0 z-10 font-bold`}>TOTAL</td>
                  <td className={S_TOTAL_LABEL}>{fullMonth}</td>
                  {items.map((item) => (
                    <td key={item.id} className={S_TOTAL}>
                      {month.totals[item.id] ?? 0}
                    </td>
                  ))}
                  <td className={S_TOTAL}></td>
                </tr>

                {/* TREND row — skip first month */}
                {prevMonth && (
                  <tr key={`${month.key}-trend`}>
                    <td className={`${S_TREND} sticky left-0 z-10`}>TREND</td>
                    <td className={S_TREND_LABEL}>vs {prevShort}</td>
                    {items.map((item) => {
                      const val = month.trends[item.id] ?? 0;
                      return (
                        <td key={item.id} className={S_TREND}>
                          {val > 0 ? `+${val}` : val}
                        </td>
                      );
                    })}
                    <td className={S_TREND}></td>
                  </tr>
                )}

                {/* Spacer between months */}
                <tr key={`${month.key}-spacer`}>
                  <td
                    colSpan={totalCols}
                    className="h-3 bg-gray-100 dark:bg-[#111827] border-0"
                  ></td>
                </tr>
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Water Count ──────────────────────────────────────────────────────────────
// Layout: Delivery Date | Bottles Delivered | Total in Month
// Last delivery of each month is bold + highlighted, shows monthly total
// Spacer row between months, GRAND TOTAL at bottom

function WaterCountTable({ months, stats }: { months: WaterMonth[]; stats: WaterStats }) {
  return (
    <div className="space-y-5">
      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Grand Total", value: `${stats.grand_total} bottles` },
          { label: "Total Deliveries", value: stats.total_deliveries },
          { label: "Avg / Delivery", value: `${stats.average_per_delivery} bottles` },
          { label: "Max Delivery", value: `${stats.max_delivery} bottles` },
          { label: "Min Delivery", value: `${stats.min_delivery} bottles` },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2235] p-3 text-center shadow-sm"
          >
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              {s.label}
            </p>
            <p className="text-base font-bold text-[#2E4057] dark:text-blue-300">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-300 dark:border-gray-700 shadow-md">
        <table className="border-collapse text-[11px]" style={{ minWidth: "480px" }}>
          <thead>
            <tr>
              <th className={`${S_TH} min-w-[140px]`}>Delivery Date</th>
              <th className={`${S_TH} min-w-[150px]`}>Bottles Delivered</th>
              <th className={`${S_TH} min-w-[140px]`}>Total in Month</th>
            </tr>
            {/* Excel has a second header row with caps */}
            <tr>
              <th className={`${S_TH} text-[10px] tracking-wide`}>DELIVERY DATE</th>
              <th className={`${S_TH} text-[10px] tracking-wide`}>BOTTLES DELIVERED</th>
              <th className={`${S_TH} text-[10px] tracking-wide`}>TOTAL IN MONTHS</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month) => (
              <>
                {month.deliveries.map((d, idx) => {
                  const isLast = idx === month.deliveries.length - 1;
                  const rowCls = isLast
                    ? "bg-[#BDD7EE] dark:bg-[#1e3a5f] font-bold text-gray-900 dark:text-white"
                    : "bg-white dark:bg-[#1a2235] text-gray-800 dark:text-gray-100";
                  const cellCls = `border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-center text-[11px] whitespace-nowrap ${rowCls}`;
                  return (
                    <tr key={d.id} className={rowCls}>
                      <td className={cellCls}>{fmtDate(d.delivery_date)}</td>
                      <td className={cellCls}>{d.bottles_delivered}</td>
                      <td className={cellCls}>{isLast ? month.total : ""}</td>
                    </tr>
                  );
                })}
                {/* Spacer between months */}
                <tr key={`${month.label}-spacer`}>
                  <td
                    colSpan={3}
                    className="h-3 bg-gray-100 dark:bg-[#111827] border-0"
                  ></td>
                </tr>
              </>
            ))}
            {/* Grand Total */}
            <tr className="bg-[#2E4057] text-white font-bold">
              <td className="border border-gray-400 px-3 py-2 text-center text-[11px]">GRAND TOTAL</td>
              <td className="border border-gray-400 px-3 py-2 text-center text-[11px]">{stats.grand_total}</td>
              <td className="border border-gray-400 px-3 py-2 text-center text-[11px]">{stats.grand_total}</td>
            </tr>
            {/* Summary rows */}
            {[
              { label: "Average per delivery", value: stats.average_per_delivery },
              { label: "Max delivery", value: stats.max_delivery },
              { label: "Min delivery", value: stats.min_delivery },
              { label: "Total deliveries", value: stats.total_deliveries },
            ].map((row) => (
              <tr key={row.label} className="bg-white dark:bg-[#1a2235]">
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-1 text-left text-[11px] text-gray-700 dark:text-gray-300 font-medium">
                  {row.label}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-1 text-center text-[11px] font-bold text-gray-800 dark:text-white">
                  {row.value}
                </td>
                <td className="border border-gray-300 dark:border-gray-600 px-3 py-1"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Kitchen Stock ────────────────────────────────────────────────────────────
// Layout: # | Item Name | Current Qty | Purchased | Total | Notes
// Alternating white/light rows, totals row at bottom

function KitchenStockTable({ items }: { items: StockItem[] }) {
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
            const isEven = idx % 2 === 0;
            const rowBg = isEven
              ? "bg-white dark:bg-[#1a2235]"
              : "bg-gray-50 dark:bg-[#111827]";
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
          {/* Totals row */}
          <tr className="bg-[#BDD7EE] dark:bg-[#1e3a5f] font-bold">
            <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[11px]"></td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-left text-[11px] font-bold text-gray-900 dark:text-white">
              TOTAL ITEMS IN INVENTORY
            </td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[11px] font-bold text-gray-900 dark:text-white">
              {totalCurrent}
            </td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[11px] font-bold text-gray-900 dark:text-white">
              {totalPurchased || ""}
            </td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5 text-center text-[11px] font-bold text-gray-900 dark:text-white">
              {totalAll || ""}
            </td>
            <td className="border border-gray-400 dark:border-gray-600 px-2 py-1.5"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function CategoryDetails() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const cat = decodeURIComponent(category || "");

  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<{ items: StockItem[]; months: MonthGroup[] } | null>(null);
  const [waterData, setWaterData] = useState<{ months: WaterMonth[]; stats: WaterStats } | null>(null);
  const [kitchenStockItems, setKitchenStockItems] = useState<StockItem[]>([]);

  useEffect(() => {
    if (!cat) return;
    load();
  }, [cat]);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/stock-management")}
          className="flex items-center gap-2 dark:border-gray-600 dark:text-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{cat}</h1>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            {cat === "Water Count"
              ? "Delivery log — Sep 2025 to present"
              : cat === "Kitchen Stock"
              ? "Durable items inventory"
              : "Monthly purchase log — Sep 2025 to present"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
          Loading...
        </div>
      ) : (
        <>
          {cat === "Water Count" && waterData && (
            <WaterCountTable months={waterData.months} stats={waterData.stats} />
          )}
          {cat === "Kitchen Stock" && (
            <KitchenStockTable items={kitchenStockItems} />
          )}
          {(cat === "Kitchen Essentials" ||
            cat === "Washroom Essentials" ||
            cat === "Snacks" ||
            cat === "Other Purchases") &&
            monthlyData && (
              <MonthlyPurchaseTable items={monthlyData.items} months={monthlyData.months} />
            )}
        </>
      )}
    </div>
  );
}
