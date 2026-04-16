import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "../components/ui/button";
import { api } from "../../services/api";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmtDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(2)}`;
}

function TrendCell({ value }: { value: number }) {
  if (value === 0) return <span className="text-gray-400 font-bold">0</span>;
  if (value > 0)
    return (
      <span className="text-green-600 dark:text-green-400 font-bold flex items-center justify-center gap-0.5">
        <TrendingUp className="w-3 h-3" />+{value}
      </span>
    );
  return (
    <span className="text-red-600 dark:text-red-400 font-bold flex items-center justify-center gap-0.5">
      <TrendingDown className="w-3 h-3" />{value}
    </span>
  );
}

// ─── Row-type colours matching Excel ────────────────────────────────────────
const ROW_MONTH   = "bg-[#4472C4] text-white font-bold";
const ROW_DATA    = "bg-white dark:bg-[#1a2235] text-gray-800 dark:text-gray-100";
const ROW_TOTAL   = "bg-[#BDD7EE] dark:bg-[#1e3a5f] text-gray-900 dark:text-white font-bold";
const ROW_REMAIN  = "bg-[#70AD47] text-white font-bold";
const ROW_TREND   = "bg-[#C00000] text-white font-bold";
const TH_BASE     = "px-3 py-2 text-center text-xs font-bold whitespace-nowrap border border-gray-300 dark:border-gray-600";
const TD_BASE     = "px-3 py-1.5 text-center text-xs border border-gray-200 dark:border-gray-700 whitespace-nowrap";
const TD_STICKY   = "px-3 py-1.5 text-left text-xs font-semibold border border-gray-200 dark:border-gray-700 whitespace-nowrap sticky left-0 z-10";

// ─── KITCHEN ESSENTIALS / WASHROOM ESSENTIALS / SNACKS ──────────────────────
// Shared "monthly purchase log" layout

interface MonthGroup {
  key: string;
  label: string;
  dates: Record<string, Record<string, number>>;
  totals: Record<string, number>;
  trends: Record<string, number>;
}

interface StockItem {
  id: string;
  item_name: string;
  unit: string;
  current_quantity: number;
}

function MonthlyPurchaseTable({
  items,
  months,
  category,
}: {
  items: StockItem[];
  months: MonthGroup[];
  category: string;
}) {
  const colHeader = (item: StockItem) =>
    `${item.item_name}${item.unit ? ` (${item.unit})` : ""}`;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
      <table className="min-w-full border-collapse text-xs">
        <thead>
          <tr className="bg-[#4472C4] text-white">
            <th className={`${TH_BASE} sticky left-0 z-20 bg-[#4472C4] min-w-[60px]`}>Month</th>
            <th className={`${TH_BASE} min-w-[90px]`}>Date</th>
            {items.map((item) => (
              <th key={item.id} className={`${TH_BASE} min-w-[100px]`}>
                {colHeader(item)}
              </th>
            ))}
            <th className={`${TH_BASE} min-w-[120px]`}>Comments</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month, mIdx) => {
            const dateKeys = Object.keys(month.dates).sort();
            const prevMonth = mIdx > 0 ? months[mIdx - 1] : null;
            const rows: JSX.Element[] = [];

            // Data rows
            dateKeys.forEach((dateStr, dIdx) => {
              rows.push(
                <tr key={`${month.key}-${dateStr}`} className={ROW_DATA}>
                  {dIdx === 0 ? (
                    <td
                      rowSpan={dateKeys.length}
                      className={`${TD_STICKY} ${ROW_MONTH} text-center`}
                    >
                      {month.label.split(" ")[0]}
                    </td>
                  ) : null}
                  <td className={TD_BASE}>{fmtDate(dateStr)}</td>
                  {items.map((item) => (
                    <td key={item.id} className={TD_BASE}>
                      {month.dates[dateStr]?.[item.id] != null
                        ? month.dates[dateStr][item.id]
                        : ""}
                    </td>
                  ))}
                  <td className={TD_BASE}></td>
                </tr>
              );
            });

            // TOTAL row
            rows.push(
              <tr key={`${month.key}-total`} className={ROW_TOTAL}>
                <td className={`${TD_STICKY} ${ROW_TOTAL}`}>TOTAL</td>
                <td className={`${TD_BASE} font-bold`}>{month.label}</td>
                {items.map((item) => (
                  <td key={item.id} className={`${TD_BASE} font-bold`}>
                    {month.totals[item.id] ?? 0}
                  </td>
                ))}
                <td className={TD_BASE}></td>
              </tr>
            );

            // TREND row (skip first month)
            if (prevMonth) {
              rows.push(
                <tr key={`${month.key}-trend`} className={ROW_TREND}>
                  <td className={`${TD_STICKY} ${ROW_TREND}`}>TREND</td>
                  <td className={`${TD_BASE} text-white font-bold`}>
                    vs {prevMonth.label.split(" ")[0]}
                  </td>
                  {items.map((item) => (
                    <td key={item.id} className={`${TD_BASE}`}>
                      <TrendCell value={month.trends[item.id] ?? 0} />
                    </td>
                  ))}
                  <td className={TD_BASE}></td>
                </tr>
              );
            }

            // Spacer
            rows.push(
              <tr key={`${month.key}-spacer`} className="h-2 bg-gray-50 dark:bg-[#111827]">
                <td colSpan={items.length + 3}></td>
              </tr>
            );

            return rows;
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── WATER COUNT TABLE ───────────────────────────────────────────────────────

interface WaterMonth {
  label: string;
  deliveries: { id: string; delivery_date: string; bottles_delivered: number }[];
  total: number;
}

interface WaterStats {
  grand_total: number;
  total_deliveries: number;
  average_per_delivery: number;
  max_delivery: number;
  min_delivery: number;
}

function WaterCountTable({
  months,
  stats,
}: {
  months: WaterMonth[];
  stats: WaterStats;
}) {
  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Grand Total", value: stats.grand_total + " bottles" },
          { label: "Total Deliveries", value: stats.total_deliveries },
          { label: "Avg / Delivery", value: stats.average_per_delivery + " bottles" },
          { label: "Max Delivery", value: stats.max_delivery + " bottles" },
          { label: "Min Delivery", value: stats.min_delivery + " bottles" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2235] p-3 text-center shadow-sm"
          >
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">{s.label}</p>
            <p className="text-lg font-bold text-[#4472C4] dark:text-blue-400">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Delivery log table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr className="bg-[#4472C4] text-white">
              <th className={`${TH_BASE} min-w-[130px]`}>Delivery Date</th>
              <th className={`${TH_BASE} min-w-[140px]`}>Bottles Delivered</th>
              <th className={`${TH_BASE} min-w-[130px]`}>Total in Month</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month) => {
              const rows: JSX.Element[] = [];
              month.deliveries.forEach((d, idx) => {
                const isLast = idx === month.deliveries.length - 1;
                rows.push(
                  <tr
                    key={d.id}
                    className={
                      isLast
                        ? "bg-[#BDD7EE] dark:bg-[#1e3a5f] font-bold text-gray-900 dark:text-white"
                        : ROW_DATA
                    }
                  >
                    <td className={`${TD_BASE} ${isLast ? "font-bold" : ""}`}>
                      {fmtDate(d.delivery_date)}
                    </td>
                    <td className={`${TD_BASE} ${isLast ? "font-bold" : ""}`}>
                      {d.bottles_delivered}
                    </td>
                    <td className={`${TD_BASE} font-bold`}>
                      {isLast ? month.total : ""}
                    </td>
                  </tr>
                );
              });
              // spacer
              rows.push(
                <tr key={`${month.label}-spacer`} className="h-2 bg-gray-50 dark:bg-[#111827]">
                  <td colSpan={3}></td>
                </tr>
              );
              return rows;
            })}
            {/* Grand total row */}
            <tr className="bg-[#4472C4] text-white font-bold">
              <td className={`${TD_BASE} text-white font-bold`}>GRAND TOTAL</td>
              <td className={`${TD_BASE} text-white font-bold`}>{stats.grand_total}</td>
              <td className={`${TD_BASE} text-white font-bold`}>{stats.grand_total}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── KITCHEN STOCK TABLE ─────────────────────────────────────────────────────

interface KitchenStockItem extends StockItem {
  purchased_qty: number;
  total_qty: number;
  notes: string;
}

function KitchenStockTable({ items }: { items: KitchenStockItem[] }) {
  const totalCurrent = items.reduce((s, i) => s + (i.current_quantity || 0), 0);
  const totalPurchased = items.reduce((s, i) => s + (i.purchased_qty || 0), 0);
  const totalAll = items.reduce((s, i) => s + (i.total_qty || 0), 0);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
      <table className="min-w-full border-collapse text-xs">
        <thead>
          <tr className="bg-[#4472C4] text-white">
            <th className={`${TH_BASE} min-w-[40px]`}>#</th>
            <th className={`${TH_BASE} min-w-[160px] text-left`}>Item Name</th>
            <th className={`${TH_BASE} min-w-[100px]`}>Current Qty</th>
            <th className={`${TH_BASE} min-w-[100px]`}>Purchased</th>
            <th className={`${TH_BASE} min-w-[80px]`}>Total</th>
            <th className={`${TH_BASE} min-w-[120px]`}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={item.id}
              className={idx % 2 === 0 ? ROW_DATA : "bg-gray-50 dark:bg-[#111827] text-gray-800 dark:text-gray-100"}
            >
              <td className={`${TD_BASE}`}>{idx + 1}</td>
              <td className={`${TD_BASE} text-left font-medium`}>{item.item_name}</td>
              <td className={`${TD_BASE} font-semibold`}>{item.current_quantity || ""}</td>
              <td className={`${TD_BASE}`}>{item.purchased_qty || ""}</td>
              <td className={`${TD_BASE}`}>{item.total_qty || ""}</td>
              <td className={`${TD_BASE} text-gray-500 dark:text-gray-400`}>{item.notes || ""}</td>
            </tr>
          ))}
          {/* Totals row */}
          <tr className={ROW_TOTAL}>
            <td className={`${TD_BASE} font-bold`}></td>
            <td className={`${TD_BASE} text-left font-bold`}>TOTAL ITEMS IN INVENTORY</td>
            <td className={`${TD_BASE} font-bold`}>{totalCurrent}</td>
            <td className={`${TD_BASE} font-bold`}>{totalPurchased || ""}</td>
            <td className={`${TD_BASE} font-bold`}>{totalAll || ""}</td>
            <td className={`${TD_BASE}`}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export function CategoryDetails() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const decodedCategory = decodeURIComponent(category || "");

  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<{ items: StockItem[]; months: MonthGroup[] } | null>(null);
  const [waterData, setWaterData] = useState<{ months: WaterMonth[]; stats: WaterStats } | null>(null);
  const [kitchenStockItems, setKitchenStockItems] = useState<KitchenStockItem[]>([]);

  useEffect(() => {
    if (!decodedCategory) return;
    loadData();
  }, [decodedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (decodedCategory === "Water Count") {
        const res = await api.getWaterDeliveries();
        setWaterData({ months: res.months || [], stats: res.stats || {} });
      } else if (decodedCategory === "Kitchen Stock") {
        const res = await api.getMonthlyCategoryPurchases(decodedCategory);
        setKitchenStockItems(res.items || []);
      } else {
        const res = await api.getMonthlyCategoryPurchases(decodedCategory);
        setMonthlyData({ items: res.items || [], months: res.months || [] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/stock-management")}
          className="flex items-center gap-2 dark:border-gray-600 dark:text-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{decodedCategory}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Purchase &amp; inventory log — Excel format
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : (
        <>
          {decodedCategory === "Water Count" && waterData && (
            <WaterCountTable months={waterData.months} stats={waterData.stats} />
          )}

          {decodedCategory === "Kitchen Stock" && (
            <KitchenStockTable items={kitchenStockItems as KitchenStockItem[]} />
          )}

          {(decodedCategory === "Kitchen Essentials" ||
            decodedCategory === "Washroom Essentials" ||
            decodedCategory === "Snacks") &&
            monthlyData && (
              <MonthlyPurchaseTable
                items={monthlyData.items}
                months={monthlyData.months}
                category={decodedCategory}
              />
            )}

          {decodedCategory === "Other Purchases" && monthlyData && (
            <MonthlyPurchaseTable
              items={monthlyData.items}
              months={monthlyData.months}
              category={decodedCategory}
            />
          )}
        </>
      )}
    </div>
  );
}
