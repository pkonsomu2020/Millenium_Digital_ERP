import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { api } from "../../../services/api";

interface StockItem { id: string; category: string; item_name: string; current_quantity: number; unit: string; notes: string; }
interface PurchaseHistory { id: string; stock_item_id: string; quantity: number; purchase_date: string; notes: string; }

export function HRCategoryDetails() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<StockItem[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<Record<string, PurchaseHistory[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (category) fetchCategoryData(); }, [category]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const response = await api.getStockByCategory(decodeURIComponent(category!));
      setItems(response.data || []);
      const histories = await Promise.all(
        response.data.map((item: StockItem) =>
          api.getPurchaseHistory(item.id).then((res: { data: PurchaseHistory[] }) => ({ itemId: item.id, data: res.data }))
        )
      );
      const historyMap: Record<string, PurchaseHistory[]> = {};
      histories.forEach(({ itemId, data }: { itemId: string; data: PurchaseHistory[] }) => { historyMap[itemId] = data || []; });
      setPurchaseHistory(historyMap);
    } catch (error) { console.error("Error fetching category data:", error); }
    finally { setLoading(false); }
  };

  const purchaseDates = Array.from(new Set(Object.values(purchaseHistory).flat().map(p => p.purchase_date))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const sortedItems = [...items].sort((a, b) => (purchaseHistory[b.id] || []).reduce((s, p) => s + p.quantity, 0) - (purchaseHistory[a.id] || []).reduce((s, p) => s + p.quantity, 0));

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate("/hr/dashboard/stock-management")} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />Back
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{decodeURIComponent(category || "")}</h1>
      </div>
      {loading ? <div className="text-center py-12">Loading...</div> : (
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
                    {purchaseDates.map((date, idx) => <TableHead key={idx} className="text-center whitespace-nowrap">{new Date(date).toLocaleDateString("en-GB")}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.map((item) => {
                    const itemHistory = purchaseHistory[item.id] || [];
                    return (
                      <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <TableCell className="font-semibold sticky left-0 bg-white dark:bg-gray-800 z-10 whitespace-nowrap">{item.item_name}</TableCell>
                        {purchaseDates.map((date, idx) => {
                          const purchase = itemHistory.find(p => p.purchase_date === date);
                          return <TableCell key={idx} className="text-center">{purchase ? <span className="font-medium text-gray-900 dark:text-white">{purchase.quantity} {item.unit}</span> : <span className="text-gray-400">-</span>}</TableCell>;
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
