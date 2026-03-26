import { useState } from "react";
import { Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import { api } from "../../../services/api";

const CATEGORIES = [
  "Kitchen Essentials",
  "Washroom Essentials",
  "Snacks",
  "Water Count",
  "Kitchen Stock",
  "Other Purchases"
];

const UNITS = [
  "kg", "boxes", "tins", "pkts", "litres", "bottles", 
  "pcs", "pairs", "bars", "rolls", "bags"
];

interface AddItemDialogProps {
  onItemAdded: () => void;
}

export function AddItemDialog({ onItemAdded }: AddItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  
  const [formData, setFormData] = useState({
    category: "",
    item_name: "",
    current_quantity: "",
    unit: "",
    is_durable: false,
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.category || !formData.item_name || !formData.unit) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Resolve final category
      const resolvedCategory =
        formData.category === "Other Purchases" && customCategory.trim()
          ? customCategory.trim()
          : formData.category;

      const payload = {
        category: resolvedCategory,
        item_name: formData.item_name,
        current_quantity: parseFloat(formData.current_quantity) || 0,
        unit: formData.unit,
        is_durable: formData.is_durable,
        notes: formData.notes
      };

      await api.createStockItem(payload);

      // Reset form
      setFormData({
        category: "",
        item_name: "",
        current_quantity: "",
        unit: "",
        is_durable: false,
        notes: ""
      });
      setCustomCategory("");

      setOpen(false);
      onItemAdded(); // Refresh the list
    } catch (err: any) {
      setError(err.message || "Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#D1131B] hover:bg-[#B01018] text-white text-sm sm:text-base whitespace-nowrap">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Stock Item</DialogTitle>
          <DialogDescription>
            Add a new item to your inventory. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => {
                  setFormData({ ...formData, category: value });
                  if (value !== "Other Purchases") setCustomCategory("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.category === "Other Purchases" && (
                <div className="mt-1">
                  <Input
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category name (optional)"
                    className="dark:bg-gray-700 dark:border-gray-600"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave blank to use "Other Purchases", or type a new category name
                  </p>
                </div>
              )}
            </div>

            {/* Item Name */}
            <div className="grid gap-2">
              <Label htmlFor="item_name">Item Name *</Label>
              <Input
                id="item_name"
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                placeholder="e.g., Sugar, Coffee, Tissue"
                required
              />
            </div>

            {/* Current Quantity and Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="current_quantity">Current Quantity</Label>
                <Input
                  id="current_quantity"
                  type="number"
                  step="0.01"
                  value={formData.current_quantity}
                  onChange={(e) => setFormData({ ...formData, current_quantity: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Supplier, brand, or other notes..."
                rows={3}
              />
            </div>
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
              className="bg-[#D1131B] hover:bg-[#B01018]"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
