import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { api } from "../../../services/api";

interface AddPurchaseDialogProps {
  item: any;
  onPurchaseAdded: () => void;
}

export function AddPurchaseDialog({ item, onPurchaseAdded }: AddPurchaseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    quantity: "",
    purchase_date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
        setError("Please enter a valid quantity");
        setLoading(false);
        return;
      }

      const payload = {
        quantity: parseFloat(formData.quantity),
        unit_price: 0,
        purchase_date: formData.purchase_date,
        notes: formData.notes
      };

      await api.addPurchase(item.id, payload);

      // Reset form
      setFormData({
        quantity: "",
        purchase_date: new Date().toISOString().split('T')[0],
        notes: ""
      });

      setOpen(false);
      onPurchaseAdded(); // Refresh the list
    } catch (err: any) {
      setError(err.message || "Failed to add purchase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20">
          <ShoppingCart className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add Purchase</DialogTitle>
          <DialogDescription>
            Record a new purchase for <strong>{item.item_name}</strong>. This will automatically update the stock quantity.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Current Stock Info */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Current Stock: <strong>{item.current_quantity} {item.unit}</strong>
              </p>
            </div>

            {/* Quantity */}
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity Purchased * ({item.unit})</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder={`e.g., 10 ${item.unit}`}
                required
              />
            </div>

            {/* Purchase Date */}
            <div className="grid gap-2">
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Supplier, invoice number, or other notes..."
                rows={2}
              />
            </div>

            {/* New Stock Preview */}
            {formData.quantity && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  New Stock: <strong>{(parseFloat(item.current_quantity) + parseFloat(formData.quantity)).toFixed(2)} {item.unit}</strong>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Purchase"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
