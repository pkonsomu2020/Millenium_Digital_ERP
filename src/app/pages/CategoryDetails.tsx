import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Trash2, Edit, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { api } from "../../services/api";
import { AddItemDialog } from "../components/stock/AddItemDialog";
import { DeleteItemDialog } from "../components/stock/DeleteItemDialog";
import { AddPurchaseDialog } from "../components/stock/AddPurchaseDialog";
import { toast } from "sonner";

interface StockItem {
  id: string;
  category: string;
  item_name: string;
  current_quantity: number;
  unit: string;
  is_durable: boolean;
  notes: string;
}

interface PurchaseHistory {
  id: string;
  stock_item_id: string;
  quantity: number;
  unit_price: number;
  purchase_date: string;
  notes: string;
}

// Per-date editable row inside the dialog — no longer needed

export function CategoryDetails() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<StockItem[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<Record<string, PurchaseHistory[]>>({});
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<StockItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [editQuantity, setEditQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Inline date header editing
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editingDateValue, setEditingDateValue] = useState("");
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (category) fetchCategoryData();
  }, [category]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const response = await api.getStockByCategory(decodeURIComponent(category!));
      setItems(response.data || []);
      const historyPromises = response.data.map((item: StockItem) =>
        api.getPurchaseHistory(item.id).then((res: { data: PurchaseHistory[] }) => ({ itemId: item.id, data: res.data }))
      );
      const histories = await Promise.all(historyPromises);
      const historyMap: Record<string, PurchaseHistory[]> = {};
      histories.forEach(({ itemId, data }: { itemId: string; data: PurchaseHistory[] }) => {
        historyMap[itemId] = data || [];
      });
      setPurchaseHistory(historyMap);
    } catch (error) {
      console.error("Error fetching category data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAllPurchaseDates = () => {
    const dates = new Set<string>();
    Object.values(purchaseHistory).forEach((history) => {
      history.forEach((p) => dates.add(p.purchase_date));
    });
    return Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  };

  const purchaseDates = getAllPurchaseDates();

  const sortedItems = [...items].sort((a, b) => {
    const totalA = (purchaseHistory[a.id] || []).reduce((sum, p) => sum + p.quantity, 0);
    const totalB = (purchaseHistory[b.id] || []).reduce((sum, p) => sum + p.quantity, 0);
    return totalB - totalA;
  });

  // Open the main edit dialog — shows all dates for this item
  const openEditDialog = (item: StockItem) => {
    setEditItem(item);
    setSelectedDate(purchaseDates[0] || "");
    const firstPurchase = (purchaseHistory[item.id] || []).find(p => p.purchase_date === purchaseDates[0]);
    setEditQuantity(firstPurchase ? String(firstPurchase.quantity) : "");
    setEditDialogOpen(true);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (!editItem) return;
    const purchase = (purchaseHistory[editItem.id] || []).find(p => p.purchase_date === date);
    setEditQuantity(purchase ? String(purchase.quantity) : "");
  };

  const getCurrentPurchase = () => {
    if (!editItem || !selectedDate) return null;
    return (purchaseHistory[editItem.id] || []).find(p => p.purchase_date === selectedDate) || null;
  };

  const handleSaveAll = async () => {
    if (!editItem || !selectedDate) return;
    const qty = parseFloat(editQuantity);
    if (isNaN(qty) || qty < 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    const purchase = getCurrentPurchase();
    try {
      setSubmitting(true);
      if (purchase) {
        await api.updatePurchaseRecord(purchase.id, { quantity: qty, notes: purchase.notes });
      } else {
        await api.addPurchase(editItem.id, { quantity: qty, purchase_date: selectedDate, unit_price: 0, notes: "" });
      }
      toast.success("Saved successfully");
      setEditDialogOpen(false);
      fetchCategoryData();
    } catch (error) {
      toast.error("Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePurchase = async (purchaseId: string) => {
    if (!confirm("Delete this purchase record?")) return;
    try {
      await api.deletePurchaseRecord(purchaseId);
      toast.success("Record deleted");
      setEditQuantity("");
      fetchCategoryData();
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  const startEditDate = (date: string) => {
    setEditingDate(date);
    // Convert stored date to YYYY-MM-DD for the input
    setEditingDateValue(date.split("T")[0]);
    setTimeout(() => dateInputRef.current?.focus(), 50);
  };

  const cancelEditDate = () => {
    setEditingDate(null);
    setEditingDateValue("");
  };

  const saveEditDate = async () => {
    if (!editingDate || !editingDateValue) return;
    const newDate = editingDateValue;
    if (newDate === editingDate.split("T")[0]) { cancelEditDate(); return; }
    // Update all purchase records that have this date
    const allPurchasesOnDate: PurchaseHistory[] = [];
    Object.values(purchaseHistory).forEach(history => {
      history.forEach(p => { if (p.purchase_date.split("T")[0] === editingDate.split("T")[0]) allPurchasesOnDate.push(p); });
    });
    if (allPurchasesOnDate.length === 0) { cancelEditDate(); return; }
    try {
      await Promise.all(allPurchasesOnDate.map(p =>
        api.updatePurchaseRecord(p.id, { quantity: p.quantity, notes: p.notes, purchase_date: newDate })
      ));
      toast.success("Date updated");
      cancelEditDate();
      fetchCategoryData();
    } catch {
      toast.error("Failed to update date");
    }
  };

  const handleDeleteColumn = async (date: string) => {
    const allPurchasesOnDate: PurchaseHistory[] = [];
    Object.values(purchaseHistory).forEach(history => {
      history.forEach(p => { if (p.purchase_date.split("T")[0] === date.split("T")[0]) allPurchasesOnDate.push(p); });
    });
    if (allPurchasesOnDate.length === 0) return;
    if (!confirm(`Delete all ${allPurchasesOnDate.length} record(s) for ${new Date(date).toLocaleDateString("en-GB")}?`)) return;
    try {
      await Promise.all(allPurchasesOnDate.map(p => api.deletePurchaseRecord(p.id)));
      toast.success("Column deleted");
      fetchCategoryData();
    } catch {
      toast.error("Failed to delete column");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/dashboard/stock-management")} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {decodeURIComponent(category || "")}
          </h1>
        </div>
        <AddItemDialog onItemAdded={fetchCategoryData} />
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="bg-gradient-to-r from-[#D1131B]/10 to-[#D1131B]/5 dark:from-gray-700 dark:to-gray-800">
            <CardTitle className="text-lg sm:text-xl">Stock & Purchase History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100 dark:bg-gray-800">
                    <TableHead className="font-bold sticky left-0 bg-gray-100 dark:bg-gray-800 z-10 whitespace-nowrap">ITEM NAME</TableHead>
                    {purchaseDates.map((date, idx) => (
                      <TableHead key={idx} className="text-center whitespace-nowrap">
                        {editingDate === date ? (
                          <div className="flex items-center gap-1 justify-center">
                            <input
                              ref={dateInputRef}
                              type="date"
                              value={editingDateValue}
                              onChange={e => setEditingDateValue(e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter") saveEditDate(); if (e.key === "Escape") cancelEditDate(); }}
                              className="text-xs border border-[#D1131B] rounded px-1 py-0.5 bg-white dark:bg-gray-700 dark:text-white w-32"
                            />
                            <button onClick={saveEditDate} className="text-green-500 hover:text-green-700"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={cancelEditDate} className="text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1 group">
                            <button
                              onClick={() => startEditDate(date)}
                              className="hover:text-[#D1131B] hover:underline transition-colors cursor-pointer"
                              title="Click to edit date"
                            >
                              {new Date(date).toLocaleDateString("en-GB")}
                            </button>
                            <button
                              onClick={() => handleDeleteColumn(date)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 ml-1"
                              title="Delete entire column"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </TableHead>
                    ))}
                    <TableHead className="text-center sticky right-0 bg-gray-100 dark:bg-gray-800 whitespace-nowrap">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.map((item) => {
                    const itemHistory = purchaseHistory[item.id] || [];
                    return (
                      <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <TableCell className="font-semibold sticky left-0 bg-white dark:bg-gray-800 z-10 whitespace-nowrap">
                          {item.item_name}
                        </TableCell>
                        {purchaseDates.map((date, idx) => {
                          const purchase = itemHistory.find((p) => p.purchase_date === date);
                          return (
                            <TableCell key={idx} className="text-center">
                              <span className={purchase ? "font-medium text-gray-900 dark:text-white" : "text-gray-400"}>
                                {purchase ? `${purchase.quantity} ${item.unit}` : "-"}
                              </span>
                            </TableCell>
                          );
                        })}
                        <TableCell className="sticky right-0 bg-white dark:bg-gray-800">
                          <div className="flex items-center justify-center gap-1">
                            <AddPurchaseDialog item={item} onPurchaseAdded={fetchCategoryData} />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openEditDialog(item)}
                              title="Edit quantities across dates"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <DeleteItemDialog item={item} onItemDeleted={fetchCategoryData} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit All Dates Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px] dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              Edit Quantities — {editItem?.item_name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Date dropdown */}
            <div className="grid gap-2">
              <Label>Select Date</Label>
              <Select value={selectedDate} onValueChange={handleDateChange}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectValue placeholder="Pick a date" />
                </SelectTrigger>
                <SelectContent>
                  {purchaseDates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity input for selected date */}
            {selectedDate && (
              <div className="grid gap-2">
                <Label htmlFor="edit-qty">Quantity ({editItem?.unit})</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-qty"
                    type="number"
                    min="0"
                    step="any"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    placeholder="0"
                    className="dark:bg-gray-700 dark:border-gray-600"
                    autoFocus
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {editItem?.unit}
                  </span>
                  {getCurrentPurchase() && (
                    <button
                      onClick={() => handleDeletePurchase(getCurrentPurchase()!.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 flex-shrink-0"
                      title="Delete this record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              className="bg-[#D1131B] hover:bg-[#B01018] text-white"
              onClick={handleSaveAll}
              disabled={submitting || !selectedDate}
            >
              {submitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
