import { useState, useEffect, useRef, ReactNode } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "../ui/button";

/* Register table styles — matches site theme (light/dark via dashboard layout) */

export const REG = {
  border: "border border-gray-200 dark:border-gray-700",
  data: "border border-gray-200 dark:border-gray-700 px-2.5 py-2 text-xs text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 align-middle",
  dataLeft:
    "border border-gray-200 dark:border-gray-700 px-2.5 py-2 text-xs text-left font-medium bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 align-middle min-w-[120px] max-w-[140px] sm:min-w-[160px] sm:max-w-none sticky left-0 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.12)] dark:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.4)]",
  stickyHdr:
    "border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-[11px] text-left font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 sticky left-0 z-20 min-w-[120px] sm:min-w-[160px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.12)]",
  stickySubLeft:
    "border border-gray-200 dark:border-gray-700 px-2.5 py-2 text-[11px] font-bold text-left bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 sticky left-0 z-10 min-w-[120px] sm:min-w-[160px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.12)]",
  stickyGrandLeft:
    "border border-gray-200 dark:border-gray-700 px-2.5 py-2 text-xs font-extrabold uppercase text-left bg-red-50 dark:bg-red-900/20 text-[#E76F51] dark:text-red-400 sticky left-0 z-10 min-w-[120px] sm:min-w-[160px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.12)]",
  subHdr: "border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-[10px] text-center whitespace-nowrap bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
  subHdrLeft: "border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-[11px] text-left font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200",
  grpItem: "border border-gray-200 dark:border-gray-700 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-left bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
  grpP1: "border border-gray-200 dark:border-gray-700 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-2 border-l-blue-500",
  grpP2: "border border-gray-200 dark:border-gray-700 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-center bg-emerald-50 dark:bg-emerald-900/25 text-emerald-700 dark:text-emerald-300 border-l-2 border-l-emerald-500",
  grpSum: "border border-gray-200 dark:border-gray-700 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider text-center bg-amber-50 dark:bg-amber-900/25 text-amber-800 dark:text-amber-300 border-l-2 border-l-amber-500",
  catRow: "border border-gray-200 dark:border-gray-700 px-2.5 py-2 text-[11px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-l-[3px] border-l-[#E76F51]",
  subtotal: "border border-gray-200 dark:border-gray-700 px-2.5 py-2 text-[11px] font-medium text-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
  subtotalLeft: "border border-gray-200 dark:border-gray-700 px-2.5 py-2 text-[11px] font-bold text-left bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
  trend: "border border-gray-200 dark:border-gray-700 px-2.5 py-2 text-[11px] font-medium text-center bg-red-50 dark:bg-red-900/20",
  trendLeft: "border border-gray-200 dark:border-gray-700 px-2.5 py-2 text-[10px] font-bold uppercase text-left bg-red-50 dark:bg-red-900/20 text-gray-700 dark:text-gray-200",
  grand: "border border-gray-200 dark:border-gray-700 px-2.5 py-2 text-xs font-semibold text-center bg-red-50 dark:bg-red-900/20 text-[#E76F51] dark:text-red-400",
  grandLeft: "border border-gray-200 dark:border-gray-700 px-2.5 py-2 text-xs font-extrabold uppercase text-left bg-red-50 dark:bg-red-900/20 text-[#E76F51] dark:text-red-400",
  p1Start: "border-l-2 border-l-blue-500/50",
  p2Start: "border-l-2 border-l-emerald-500/50",
  smStart: "border-l-2 border-l-amber-500/50",
  pOpen: "bg-blue-500/5",
  pBought: "bg-emerald-500/5",
  pUsed: "bg-red-500/5",
  pClose: "bg-amber-500/5 font-medium",
};

/** Row order from Excel / migration seed (generate_migration.py). */
export const EXCEL_ITEM_ORDER: Record<string, string[]> = {
  "Kitchen Essentials": [
    "Sugar", "Milk", "Drinking Chocolate", "Coffee", "Tea Leaves", "Matchbox",
    "Morning Fresh", "Bar Soap", "Super Brite", "Batteries",
  ],
  "Washroom Essentials": [
    "Tissue", "Serviettes", "Hand Towels", "Toilet Balls", "Liquid Washing Soap", "Gloves",
    "Mop", "Hand Wash", "Washroom Soap", "Glass Cleaner", "Jik White", "Jik Coloured",
    "Furniture Polish", "Washing Powder",
  ],
  "Kitchen Stock": [
    "Plates", "Side Plates", "Spoons", "Tea Spoons", "Forks", "Glasses", "Cups", "Thermos",
    "Glass Jugs", "Plastic Jugs", "Serving Trays", "Tumblers", "Sufurias (Pots)", "Buckets",
    "Dustbins", "Sugar Dish", "Salt Shakers", "Kitchen Towels", "Pegs", "Cloth Line",
    "Scrubbing Brush", "Long Brushes",
  ],
  "Water Count": ["Dispenser Bottles"],
};

export function excelItemIndex(category: string, itemName: string): number {
  const list = EXCEL_ITEM_ORDER[category];
  if (!list) return 9999;
  const i = list.indexOf(itemName);
  return i >= 0 ? i : 9999;
}

/** Item row cells: empty for null and zero (matches Excel). */
export function fmtQtyDisplay(v: unknown): string {
  if (v === null || v === undefined || v === "") return "";
  const n = Number(v);
  if (Number.isNaN(n) || n === 0) return "";
  return String(n);
}

/** Subtotal / grand total rows: show 0 where Excel shows 0. */
export function fmtQtyAggregate(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return "—";
  return String(n);
}

/** @deprecated use fmtQtyDisplay or fmtQtyAggregate */
export const fmtQty = fmtQtyDisplay;

export function qtyCellClass(v: unknown, blankZero = true): string {
  if (v === null || v === undefined || v === "") return "";
  const n = Number(v);
  if (Number.isNaN(n)) return "";
  if (blankZero && n === 0) return "";
  if (n > 0 && n <= 3) return "text-amber-600 dark:text-amber-400";
  return "";
}

export function itemHasKitchenData(item: {
  current_quantity?: number;
  purchased_qty?: number;
  broken_lost_qty?: number;
  total_qty?: number;
}): boolean {
  return (
    (item.current_quantity ?? 0) !== 0 ||
    (item.purchased_qty ?? 0) !== 0 ||
    (item.broken_lost_qty ?? 0) !== 0 ||
    (item.total_qty ?? 0) !== 0
  );
}

export function sortKitchenItemsDataFirst<
  T extends { id: string; item_name: string; current_quantity?: number; purchased_qty?: number; broken_lost_qty?: number; total_qty?: number; created_at?: string }
>(items: T[], category = "Kitchen Stock"): T[] {
  return items
    .map((item) => ({
      item,
      hasData: itemHasKitchenData(item),
      order: excelItemIndex(category, item.item_name),
      isNew: excelItemIndex(category, item.item_name) === 9999,
    }))
    .sort((a, b) => {
      // 1. New/custom items always go to the top
      if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;

      // 2. If both are new, sort by created_at descending (newest first)
      if (a.isNew) {
        const timeA = a.item.created_at ? new Date(a.item.created_at).getTime() : 0;
        const timeB = b.item.created_at ? new Date(b.item.created_at).getTime() : 0;
        if (timeA !== timeB) return timeB - timeA;
        return a.item.item_name.localeCompare(b.item.item_name);
      }

      // 3. For predefined items, sort by hasData first (as originally done)
      if (a.hasData !== b.hasData) return a.hasData ? -1 : 1;

      // 4. Then by their original Excel order
      return a.order - b.order;
    })
    .map((x) => x.item);
}

export function sortOverviewItemsDataFirst<T extends { item_name: string; current_quantity?: number }>(
  items: T[],
  category: string
): T[] {
  return items
    .map((item) => ({
      item,
      hasData: (item.current_quantity ?? 0) > 0,
      order: excelItemIndex(category, item.item_name),
    }))
    .sort((a, b) => {
      if (a.hasData !== b.hasData) return a.hasData ? -1 : 1;
      return a.order - b.order;
    })
    .map((x) => x.item);
}

export function trendCellClass(v: number): string {
  if (v > 0) return "text-emerald-600 dark:text-emerald-400";
  if (v < 0) return "text-[#E76F51]";
  return "text-gray-400 dark:text-gray-500";
}

export function fmtTrend(v: number): string {
  if (v > 0) return `+${v}`;
  return String(v);
}

const ENTRY_FIELDS = [
  "p1_opening", "p1_bought", "p1_used", "p1_closing",
  "p2_opening", "p2_bought", "p2_used", "p2_closing",
  "total_bought", "total_used", "stock_movement", "final_closing",
] as const;

export type EntryField = (typeof ENTRY_FIELDS)[number];

/** Columns you type in (matches Excel input cells). */
export const EDITABLE_ENTRY_FIELDS: ReadonlySet<EntryField> = new Set([
  "p1_bought",
  "p1_used",
  "p2_bought",
  "p2_used",
]);

/** Formula columns — recalculated on save; not directly editable. */
export const COMPUTED_ENTRY_FIELDS: ReadonlySet<EntryField> = new Set(
  ENTRY_FIELDS.filter((f) => !EDITABLE_ENTRY_FIELDS.has(f))
);

const COMPUTED_FIELD_HINT: Partial<Record<EntryField, string>> = {
  p1_opening: "Calculated: Opening stock is strictly linked to previous month's closing",
  p1_closing: "Calculated: Opening + Bought − Used (Period 1)",
  p2_opening: "Calculated: Opening stock exactly matches Period 1 closing",
  p2_closing: "Calculated: Opening + Bought − Used (Period 2)",
  total_bought: "Calculated: Period 1 Bought + Period 2 Bought",
  total_used: "Calculated: Period 1 Used + Period 2 Used",
  stock_movement: "Calculated: Total Bought − Total Used",
  final_closing: "Calculated: Period 2 closing stock (or Period 1 if no Period 2)",
};

export function isEditableEntryField(field: EntryField): boolean {
  return EDITABLE_ENTRY_FIELDS.has(field);
}

export function entryPayloadForUpsert(
  itemId: string,
  monthId: string,
  entry: Record<string, unknown>,
  editedField?: EntryField
): Record<string, unknown> {
  const e = recalcEntry(entry, editedField);
  return {
    stock_item_id: itemId,
    month_id: monthId,
    p1_opening: Number(e.p1_opening) || 0,
    p1_bought: Number(e.p1_bought) || 0,
    p1_used: Number(e.p1_used) || 0,
    p1_closing: Number(e.p1_closing) || 0,
    p2_opening: Number(e.p2_opening) || 0,
    p2_bought: Number(e.p2_bought) || 0,
    p2_used: Number(e.p2_used) || 0,
    p2_closing: Number(e.p2_closing) || 0,
    total_bought: Number(e.total_bought) || 0,
    total_used: Number(e.total_used) || 0,
    stock_movement: Number(e.stock_movement) || 0,
    final_closing: Number(e.final_closing) || 0,
  };
}

/** True if the item has any non-zero value for this month (Excel: rows with data first). */
export function itemHasMonthData(
  itemId: string,
  monthId: string,
  entryMap: Record<string, Record<string, unknown>>
): boolean {
  const e = entryMap[itemId]?.[monthId] as Record<string, unknown> | undefined;
  if (!e) return false;
  return ENTRY_FIELDS.some((f) => {
    const v = e[f];
    if (v === null || v === undefined || v === "") return false;
    const n = Number(v);
    return !Number.isNaN(n) && n !== 0;
  });
}

/** Items with data first, blank rows last; Excel row order within each group. */
export function sortItemsDataFirst<T extends { id: string; item_name: string }>(
  items: T[],
  category: string,
  monthId: string,
  entryMap: Record<string, Record<string, unknown>>
): T[] {
  return items
    .map((item) => ({
      item,
      hasData: itemHasMonthData(item.id, monthId, entryMap),
      order: excelItemIndex(category, item.item_name),
    }))
    .sort((a, b) => {
      if (a.hasData !== b.hasData) return a.hasData ? -1 : 1;
      return a.order - b.order;
    })
    .map((x) => x.item);
}

export function recalcEntry(entry: Record<string, unknown>, editedField?: EntryField): Record<string, unknown> {
  const e = { ...entry };
  const p1o = Number(e.p1_opening) || 0;
  const p1b = Number(e.p1_bought) || 0;
  const p1u = Number(e.p1_used) || 0;
  e.p1_closing = p1o + p1b - p1u;
  // Period 2 opening usually equals Period 1 closing — unless you edited P2 opening directly.
  if (editedField !== "p2_opening") {
    e.p2_opening = Number(e.p1_closing) || 0;
  }
  const p2o = Number(e.p2_opening) || 0;
  const p2b = Number(e.p2_bought) || 0;
  const p2u = Number(e.p2_used) || 0;
  e.p2_closing = p2o + p2b - p2u;
  e.total_bought = p1b + p2b;
  e.total_used = p1u + p2u;
  e.stock_movement = Number(e.total_bought) - Number(e.total_used);
  e.final_closing = Number(e.p2_closing) || Number(e.p1_closing) || 0;
  return e;
}

export function sumEntries(items: { id: string }[], entryMap: Record<string, Record<string, unknown>>, monthId: string) {
  const sums: Record<string, number> = {};
  ENTRY_FIELDS.forEach((f) => { sums[f] = 0; });
  items.forEach((item) => {
    const e = entryMap[item.id]?.[monthId] as Record<string, unknown> | undefined;
    ENTRY_FIELDS.forEach((f) => {
      sums[f] += Number(e?.[f]) || 0;
    });
  });
  return sums;
}

export function EditableQtyCell({
  value,
  onSave,
  editable,
  className = REG.data,
  accent = "",
}: {
  value: unknown;
  onSave: (n: number) => void | Promise<void>;
  editable: boolean;
  className?: string;
  accent?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) ref.current?.select();
  }, [editing]);

  useEffect(() => {
    if (value === null || value === undefined || value === "") {
      setVal("");
      return;
    }
    const n = Number(value);
    setVal(Number.isNaN(n) || n === 0 ? "" : String(n));
  }, [value]);

  const commit = async () => {
    setEditing(false);
    if (val === "") {
      await onSave(0);
      return;
    }
    const num = Number(val);
    if (Number.isNaN(num)) return;
    if (num === Number(value)) return;
    await onSave(num);
  };

  const display = fmtQtyDisplay(value);
  const cls = `${className} ${accent} ${qtyCellClass(value, true)}`;

  if (!editable) {
    return <td className={cls}>{display}</td>;
  }

  if (editing) {
    return (
      <td className={className} style={{ padding: 0 }}>
        <input
          ref={ref}
          type="number"
          step="0.5"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="w-full min-w-[52px] px-1 py-1.5 text-xs text-center bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-400 outline-none"
        />
      </td>
    );
  }

  return (
    <td className={`${cls} cursor-pointer hover:bg-amber-50/80 dark:hover:bg-amber-900/20`} onClick={() => setEditing(true)} title="Click to edit">
      {display}
    </td>
  );
}

export function QtyCell({
  value,
  className = REG.data,
  accent = "",
  computed = false,
  hint,
}: {
  value: unknown;
  className?: string;
  accent?: string;
  computed?: boolean;
  hint?: string;
}) {
  const calcClass = computed
    ? "cursor-default select-none font-semibold text-gray-800 dark:text-gray-100"
    : "";
  return (
    <td
      className={`${className} ${accent} ${qtyCellClass(value, true)} ${calcClass}`}
      title={hint}
    >
      {fmtQtyDisplay(value)}
    </td>
  );
}

export function RegisterEditLegend({ editable }: { editable: boolean }) {
  if (!editable) {
    return (
      <p className="mx-3 sm:mx-4 lg:mx-6 mb-2 text-[11px] text-gray-500 dark:text-gray-400">
        Read-only view — switch to the admin dashboard to edit stock entries.
      </p>
    );
  }
  return (
    <p className="mx-3 sm:mx-4 lg:mx-6 mb-2 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
      <span className="inline-flex items-center gap-1 mr-3">
        <span className="inline-block w-3 h-3 rounded border-2 border-amber-400 bg-amber-50 dark:bg-amber-900/30" aria-hidden />
        Click to edit: Opening, Bought, Used (both periods)
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="font-semibold text-gray-700 dark:text-gray-200" aria-hidden>12</span>
        Bold = auto-calculated (Closing, totals, movement)
      </span>
    </p>
  );
}

export function DetailHeader({
  title,
  subtitle,
  onBack,
  onAdd,
  addLabel = "+ Add Item",
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
  onAdd?: () => void;
  addLabel?: string;
}) {
  const addText = addLabel.replace(/^\+?\s*/, "");
  return (
    <div className="sticky top-[52px] lg:top-0 z-20 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className="px-3 sm:px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 px-2.5 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#E76F51] hover:text-[#E76F51] transition-colors"
          >
            ← Back
          </button>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white leading-snug truncate">
              {title}
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{subtitle}</p>
          </div>
        </div>
        {onAdd && (
          <Button
            onClick={onAdd}
            size="sm"
            className="w-full sm:w-auto shrink-0 bg-[#E76F51] hover:bg-[#D0593B] text-white font-semibold text-xs uppercase tracking-wide h-10"
          >
            <Plus className="w-4 h-4 mr-1.5 shrink-0" /> {addText}
          </Button>
        )}
      </div>
    </div>
  );
}

export function MonthTabs({
  months,
  activeId,
  onChange,
  onAddMonth,
}: {
  months: { id: string; month_label: string; month_key: string }[];
  activeId: string;
  onChange: (id: string) => void;
  onAddMonth?: () => void;
}) {
  return (
    <div className="px-3 sm:px-6 pt-3 pb-1 flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
      <div
        className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] scrollbar-thin pb-2 flex-1 w-full"
        role="tablist"
        aria-label="Select month"
      >
        <div className="flex flex-nowrap gap-1.5 w-max min-w-full pr-2">
          {months.map((m) => {
            const short = m.month_label?.split(" ")[0]?.slice(0, 3).toUpperCase() || m.month_key;
            const yr = m.month_key?.slice(2, 4) || "";
            const isActive = activeId === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange(m.id)}
                className={`shrink-0 px-3 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wide border transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-[#E76F51] shadow-sm"
                    : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {short} {yr}
              </button>
            );
          })}
        </div>
      </div>
      {onAddMonth && (
        <button
          onClick={onAddMonth}
          className="shrink-0 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wide border border-[#E76F51] text-[#E76F51] bg-red-50 hover:bg-[#E76F51] hover:text-white transition-colors flex items-center mb-2 sm:mb-0"
          title="Add Future Month Template"
        >
          <Plus className="w-3 h-3 mr-1" /> Add Month
        </button>
      )}
      {months.length > 4 && !onAddMonth && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 lg:hidden">Swipe horizontally for more months</p>
      )}
    </div>
  );
}

export function RegisterMonthTable({
  month,
  isFirstMonth,
  categoryLabel,
  items,
  entryMap,
  editable,
  onCellSave,
}: {
  month: { id: string; month_label: string; period_1_label?: string; period_2_label?: string };
  isFirstMonth?: boolean;
  categoryLabel: string;
  items: { id: string; item_name: string; unit: string }[];
  entryMap: Record<string, Record<string, unknown>>;
  editable: boolean;
  onCellSave: (itemId: string, monthId: string, field: EntryField, value: number) => void | Promise<void>;
}) {
  const sortedItems = sortItemsDataFirst(items, categoryLabel, month.id, entryMap);
  const sums = sumEntries(sortedItems, entryMap, month.id);

  const p1Label = month.period_1_label || "Period 1";
  const p2Label = month.period_2_label || "Period 2";
  const monthShort = month.month_label?.split(" ")[0] || "Month";

  const renderRow = (item: { id: string; item_name: string; unit: string }) => {
    const e = (entryMap[item.id]?.[month.id] || {}) as Record<string, unknown>;
    const cell = (field: EntryField, accent: string) => {
      const canEdit = editable && (isEditableEntryField(field) || (field === "p1_opening" && isFirstMonth));
      return canEdit ? (
        <EditableQtyCell
          key={field}
          value={e[field]}
          accent={accent}
          editable
          onSave={(v) => onCellSave(item.id, month.id, field, v)}
        />
      ) : (
        <QtyCell
          key={field}
          value={e[field]}
          accent={accent}
          computed
          hint={COMPUTED_FIELD_HINT[field]}
        />
      );
    };

    return (
      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <td className={REG.dataLeft}>
          {item.item_name} <span className="text-gray-400 dark:text-gray-500 font-normal">({item.unit})</span>
        </td>
        {cell("p1_opening", `${REG.p1Start} ${REG.pOpen}`)}
        {cell("p1_bought", REG.pBought)}
        {cell("p1_used", REG.pUsed)}
        {cell("p1_closing", REG.pClose)}
        {cell("p2_opening", `${REG.p2Start} ${REG.pOpen}`)}
        {cell("p2_bought", REG.pBought)}
        {cell("p2_used", REG.pUsed)}
        {cell("p2_closing", REG.pClose)}
        {cell("total_bought", `${REG.smStart} ${REG.pBought}`)}
        {cell("total_used", REG.pUsed)}
        {cell("stock_movement", REG.data)}
        {cell("final_closing", REG.pClose)}
      </tr>
    );
  };

  const renderSumCells = (values: Record<string, number>, rowClass: string, leftClass: string) => (
    <>
      <td className={leftClass}>Subtotal — {categoryLabel}</td>
      {ENTRY_FIELDS.map((f, i) => {
        const accent =
          i === 0 ? `${REG.p1Start} ${REG.pOpen}` :
          i === 4 ? `${REG.p2Start} ${REG.pOpen}` :
          i === 8 ? `${REG.smStart} ${REG.pBought}` : "";
        return (
          <td key={f} className={`${rowClass} ${accent}`}>
            {fmtQtyAggregate(values[f])}
          </td>
        );
      })}
    </>
  );

  return (
    <div className="mb-6 sm:mb-8">
      <RegisterEditLegend editable={editable} />
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-sm mx-3 sm:mx-4 lg:mx-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3 px-3 sm:px-4 py-2.5 bg-[#4a90e2] text-white">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wide">{month.month_label}</span>
        <span className="text-[10px] sm:text-[11px] opacity-90 sm:ml-auto leading-snug">
          {p1Label} · {p2Label}
        </span>
      </div>
      <div className="relative">
        <div
          className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] touch-pan-x"
          aria-label="Stock register table — scroll horizontally for all columns"
        >
        <table className="w-full border-collapse min-w-[680px] sm:min-w-[900px] text-[11px] sm:text-xs">
          <thead>
            <tr>
              <th className={`${REG.grpItem} ${REG.stickyHdr}`} rowSpan={2}>Item</th>
              <th className={REG.grpP1} colSpan={4}>{p1Label}</th>
              <th className={REG.grpP2} colSpan={4}>{p2Label}</th>
              <th className={REG.grpSum} colSpan={4}>Monthly Summary — {monthShort}</th>
            </tr>
            <tr>
              <th className={`${REG.subHdr} ${REG.p1Start}`}>Opening</th>
              <th className={REG.subHdr}>Bought</th>
              <th className={REG.subHdr}>Used</th>
              <th className={REG.subHdr}>Closing</th>
              <th className={`${REG.subHdr} ${REG.p2Start}`}>Opening</th>
              <th className={REG.subHdr}>Bought</th>
              <th className={REG.subHdr}>Used</th>
              <th className={REG.subHdr}>Closing</th>
              <th className={`${REG.subHdr} ${REG.smStart}`}>Total Bought</th>
              <th className={REG.subHdr}>Total Used</th>
              <th className={REG.subHdr}>Movement</th>
              <th className={REG.subHdr}>Final Closing</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={13} className={REG.catRow}>── {categoryLabel} ──</td>
            </tr>
            {sortedItems.map(renderRow)}
            <tr>{renderSumCells(sums, REG.subtotal, REG.stickySubLeft)}</tr>
            <tr>
              <td className={REG.stickyGrandLeft}>GRAND TOTAL</td>
              {ENTRY_FIELDS.map((f, i) => {
                const accent =
                  i === 0 ? REG.p1Start : i === 4 ? REG.p2Start : i === 8 ? REG.smStart : "";
                return (
                  <td key={f} className={`${REG.grand} ${accent}`}>
                    {fmtQtyAggregate(sums[f])}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white/90 to-transparent dark:from-gray-800/90 lg:hidden"
          aria-hidden
        />
      </div>
      <p className="px-3 py-1.5 text-[10px] text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 lg:hidden">
        Scroll table sideways to view Period 2 and monthly summary
      </p>
      </div>
    </div>
  );
}

export function KitchenStockRegisterTable({
  items,
  editable,
  onUpdate,
}: {
  items: {
    id: string;
    item_name: string;
    current_quantity?: number;
    purchased_qty?: number;
    broken_lost_qty?: number;
    total_qty?: number;
    notes?: string;
  }[];
  editable: boolean;
  onUpdate?: (id: string, updates: Record<string, number>) => void | Promise<void>;
}) {
  const status = (item: (typeof items)[0], closing: number) => {
    if (!itemHasKitchenData(item)) {
      return { label: "", className: "" };
    }
    if (closing <= 1) return { label: "CRITICAL", className: "text-[#E76F51] font-semibold text-[11px]" };
    if (closing <= 3) return { label: "LOW", className: "text-amber-600 dark:text-amber-400 font-semibold text-[11px]" };
    return { label: "OK", className: "text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]" };
  };

  const sortedItems = sortKitchenItemsDataFirst(items);

  const totals = sortedItems.reduce(
    (a, i) => ({
      open: a.open + (i.current_quantity || 0),
      bought: a.bought + (i.purchased_qty || 0),
      used: a.used + (i.broken_lost_qty || 0),
      close: a.close + (i.total_qty || 0),
    }),
    { open: 0, bought: 0, used: 0, close: 0 }
  );

  const cell = (
    itemId: string,
    field: "current_quantity" | "purchased_qty" | "broken_lost_qty",
    value: number | undefined,
    accent: string
  ) =>
    editable && onUpdate ? (
      <EditableQtyCell value={value} accent={accent} editable onSave={(v) => onUpdate(itemId, { [field]: v })} />
    ) : (
      <QtyCell value={value} accent={accent} />
    );

  return (
    <div className="mx-3 sm:mx-4 lg:mx-6 mb-6 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      <div
        className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] touch-pan-x"
        aria-label="Kitchen stock table"
      >
      <table className="w-full border-collapse min-w-[520px] sm:min-w-[700px] text-[11px] sm:text-xs">
        <thead>
          <tr>
            <th className={`${REG.stickyHdr} min-w-[120px] sm:min-w-[200px]`}>Item Name</th>
            <th className={`${REG.subHdr} ${REG.pOpen} bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300`}>Opening Stock</th>
            <th className={`${REG.subHdr} ${REG.pBought} bg-emerald-50 dark:bg-emerald-900/25 text-emerald-700 dark:text-emerald-300`}>Bought / Added</th>
            <th className={`${REG.subHdr} ${REG.pUsed} bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300`}>Broken / Lost</th>
            <th className={`${REG.subHdr} ${REG.pClose} bg-amber-50 dark:bg-amber-900/25 text-amber-800 dark:text-amber-300`}>Total</th>
            <th className={`${REG.subHdr} bg-red-50 dark:bg-red-900/20 text-[#E76F51]`}>Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item) => {
            const closing = item.total_qty ?? (item.current_quantity || 0) + (item.purchased_qty || 0) - (item.broken_lost_qty || 0);
            const st = status(item, closing);
            return (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className={REG.dataLeft}>{item.item_name}</td>
                {cell(item.id, "current_quantity", item.current_quantity, REG.pOpen)}
                {cell(item.id, "purchased_qty", item.purchased_qty, REG.pBought)}
                {cell(item.id, "broken_lost_qty", item.broken_lost_qty, REG.pUsed)}
                <QtyCell
                  value={closing}
                  accent={REG.pClose}
                  computed
                  hint="Calculated: Opening + Bought − Broken/Lost"
                />
                <td className={REG.data}>
                  <span className={st.className}>{st.label}</span>
                </td>
              </tr>
            );
          })}
          <tr>
            <td className={REG.stickySubLeft}>Total Kitchen Stock</td>
            <td className={`${REG.subtotal} ${REG.pOpen}`}>{fmtQtyAggregate(totals.open)}</td>
            <td className={`${REG.subtotal} ${REG.pBought}`}>{fmtQtyAggregate(totals.bought)}</td>
            <td className={`${REG.subtotal} ${REG.pUsed}`}>{fmtQtyAggregate(totals.used)}</td>
            <td className={`${REG.subtotal} ${REG.pClose}`}>{fmtQtyAggregate(totals.close)}</td>
            <td className={REG.subtotal}>—</td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  );
}

export function StatCards({
  cards,
}: {
  cards: { label: string; value: string | number; sub: string; variant: "red" | "amber" | "green" | "blue" }[];
}) {
  const top: Record<string, string> = {
    red: "bg-[#E76F51]",
    amber: "bg-amber-500",
    green: "bg-emerald-500",
    blue: "bg-blue-500",
  };
  const val: Record<string, string> = {
    red: "text-[#E76F51]",
    amber: "text-amber-600 dark:text-amber-400",
    green: "text-emerald-600 dark:text-emerald-400",
    blue: "text-blue-600 dark:text-blue-400",
  };
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((c) => (
        <div key={c.label} className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md p-4">
          <div className={`absolute top-0 left-0 right-0 h-1 ${top[c.variant]}`} />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{c.label}</p>
          <p className={`text-3xl font-bold tabular-nums ${val[c.variant]}`}>{c.value}</p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}

export function CategoryOverviewBlock({
  title,
  emoji,
  count,
  totalUnits,
  items,
  onViewDetails,
  showViewButton = true,
  category,
}: {
  title: string;
  emoji: string;
  count: number;
  totalUnits: number;
  items: { id: string; item_name: string; unit: string; current_quantity?: number }[];
  onViewDetails: () => void;
  showViewButton?: boolean;
  /** Defaults to title — used for Excel row order. */
  category?: string;
}) {
  const catKey = category ?? title;
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
        <div className="flex items-center gap-2">
          <span className="text-base">{emoji}</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{title}</span>
          <span className="min-w-[22px] text-center text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#E76F51] text-white">{count}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Total: <strong className="text-gray-800 dark:text-white">{totalUnits}</strong> units
          </span>
          {showViewButton && (
            <button
              type="button"
              onClick={onViewDetails}
              className="text-[11px] font-semibold uppercase tracking-wide text-[#E76F51] bg-red-50 dark:bg-red-900/25 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-md hover:bg-[#E76F51] hover:text-white transition-colors"
            >
              View Details →
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-gray-200 dark:bg-gray-700">
        {sortOverviewItemsDataFirst(items, catKey).map((item) => {
          const q = item.current_quantity ?? 0;
          const low = q > 0 && q <= 3;
          return (
            <div
              key={item.id}
              className={`p-3 bg-white dark:bg-gray-800 ${low ? "border-l-2 border-l-[#E76F51] bg-red-50 dark:bg-red-900/15" : ""}`}
            >
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">{item.item_name}</p>
              <p className={`text-sm font-semibold tabular-nums ${low ? "text-[#E76F51]" : q === 0 ? "text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-white"}`}>
                {q === 0 ? "" : q}
                {q !== 0 && (
                  <span className="text-[10px] font-normal text-gray-400 dark:text-gray-500 ml-1">{item.unit}</span>
                )}
                {q === 0 && (
                  <span className="text-[10px] font-normal text-gray-400 dark:text-gray-500 ml-0.5 opacity-60">{item.unit}</span>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SavingOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-4 right-4 bg-[#E76F51] text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm z-50">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
      Saving...
    </div>
  );
}
