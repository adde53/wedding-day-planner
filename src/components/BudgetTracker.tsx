import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Save, X, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface BudgetItem {
  id: string;
  category: string;
  name: string;
  estimated: number;
  actual: number;
}

const defaultCategories = [
  "Lokal",
  "Mat & Dryck",
  "Kläder",
  "Foto & Video",
  "Blommor",
  "Musik",
  "Övrigt",
];

const defaultBudgetItems: Omit<BudgetItem, "id">[] = [
  { category: "Lokal", name: "Festlokal", estimated: 50000, actual: 0 },
  { category: "Mat & Dryck", name: "Catering", estimated: 40000, actual: 0 },
  { category: "Mat & Dryck", name: "Dryck & bar", estimated: 15000, actual: 0 },
  { category: "Kläder", name: "Bröllopsklänning", estimated: 15000, actual: 0 },
  { category: "Kläder", name: "Kostym", estimated: 8000, actual: 0 },
  { category: "Foto & Video", name: "Fotograf", estimated: 20000, actual: 0 },
  { category: "Blommor", name: "Florist", estimated: 10000, actual: 0 },
  { category: "Musik", name: "Band/DJ", estimated: 15000, actual: 0 },
  { category: "Övrigt", name: "Vigselringar", estimated: 12000, actual: 0 },
  { category: "Övrigt", name: "Bröllopstårta", estimated: 5000, actual: 0 },
];

const categoryColors: Record<string, string> = {
  Lokal: "bg-primary/20 text-primary",
  "Mat & Dryck": "bg-sage/30 text-sage-dark",
  Kläder: "bg-gold-light text-accent-foreground",
  "Foto & Video": "bg-rose-light text-primary",
  Blommor: "bg-secondary text-secondary-foreground",
  Musik: "bg-muted text-muted-foreground",
  Övrigt: "bg-champagne text-foreground",
};

export function BudgetTracker() {
  const { user } = useAuth();
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [overallBudget, setOverallBudget] = useState<number>(200000);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showBudgetSettings, setShowBudgetSettings] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemEstimated, setNewItemEstimated] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEstimated, setEditEstimated] = useState("");

  const fetchItems = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("budget_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const mappedItems: BudgetItem[] = data.map((item) => ({
          id: item.id,
          category: item.category,
          name: item.name,
          estimated: Number(item.estimated_cost),
          actual: Number(item.actual_cost),
        }));
        setItems(mappedItems);

        // Extract unique categories
        const uniqueCategories = [...new Set(data.map((item) => item.category))];
        setCategories((prev) => [...new Set([...defaultCategories, ...uniqueCategories])]);
      } else {
        // Initialize with default items
        await initializeDefaultItems();
      }
    } catch (error) {
      console.error("Error fetching budget items:", error);
      toast.error("Kunde inte hämta budget");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const initializeDefaultItems = async () => {
    if (!user) return;

    const itemsToInsert = defaultBudgetItems.map((item) => ({
      user_id: user.id,
      name: item.name,
      category: item.category,
      estimated_cost: item.estimated,
      actual_cost: item.actual,
    }));

    try {
      const { data, error } = await supabase
        .from("budget_items")
        .insert(itemsToInsert)
        .select();

      if (error) throw error;

      if (data) {
        const mappedItems: BudgetItem[] = data.map((item) => ({
          id: item.id,
          category: item.category,
          name: item.name,
          estimated: Number(item.estimated_cost),
          actual: Number(item.actual_cost),
        }));
        setItems(mappedItems);
      }
    } catch (error) {
      console.error("Error initializing budget:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const totalEstimated = items.reduce((sum, item) => sum + item.estimated, 0);
  const totalActual = items.reduce((sum, item) => sum + item.actual, 0);
  const budgetDifference = overallBudget - totalActual;
  const estimatedDifference = overallBudget - totalEstimated;

  const updateActual = async (id: string, value: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, actual: value } : i))
    );
    setEditingId(null);

    try {
      const { error } = await supabase
        .from("budget_items")
        .update({ actual_cost: value })
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating actual cost:", error);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, actual: item.actual } : i))
      );
      toast.error("Kunde inte uppdatera kostnad");
    }
  };

  const updateItem = async (id: string) => {
    if (!editName.trim()) return;

    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newEstimated = parseFloat(editEstimated) || item.estimated;

    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, name: editName, estimated: newEstimated } : i
      )
    );
    setEditingItemId(null);

    try {
      const { error } = await supabase
        .from("budget_items")
        .update({ name: editName, estimated_cost: newEstimated })
        .eq("id", id);

      if (error) throw error;
      toast.success("Post uppdaterad!");
    } catch (error) {
      console.error("Error updating item:", error);
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, name: item.name, estimated: item.estimated } : i
        )
      );
      toast.error("Kunde inte uppdatera");
    }
  };

  const deleteItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setItems((prev) => prev.filter((i) => i.id !== id));

    try {
      const { error } = await supabase.from("budget_items").delete().eq("id", id);

      if (error) throw error;
      toast.success("Post borttagen!");
    } catch (error) {
      console.error("Error deleting item:", error);
      setItems((prev) => [...prev, item]);
      toast.error("Kunde inte ta bort post");
    }
  };

  const addItem = async () => {
    if (!user || !newItemName.trim() || !newItemCategory) return;

    const estimated = parseFloat(newItemEstimated) || 0;

    try {
      const { data, error } = await supabase
        .from("budget_items")
        .insert({
          user_id: user.id,
          name: newItemName,
          category: newItemCategory,
          estimated_cost: estimated,
          actual_cost: 0,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setItems((prev) => [
          ...prev,
          {
            id: data.id,
            category: data.category,
            name: data.name,
            estimated: Number(data.estimated_cost),
            actual: Number(data.actual_cost),
          },
        ]);
        setNewItemName("");
        setNewItemCategory("");
        setNewItemEstimated("");
        setShowAddItem(false);
        toast.success("Ny budgetpost tillagd!");
      }
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Kunde inte lägga till post");
    }
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    if (categories.includes(newCategoryName)) {
      toast.error("Kategorin finns redan");
      return;
    }
    setCategories((prev) => [...prev, newCategoryName]);
    setNewCategoryName("");
    setShowAddCategory(false);
    toast.success("Ny kategori tillagd!");
  };

  const deleteCategory = (category: string) => {
    const hasItems = items.some((item) => item.category === category);
    if (hasItems) {
      toast.error("Ta bort alla poster i kategorin först");
      return;
    }
    setCategories((prev) => prev.filter((c) => c !== category));
    toast.success("Kategori borttagen!");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const groupedByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, BudgetItem[]>);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-xl h-32 animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Budget Setting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl p-6 shadow-card border border-border"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-xl font-medium text-foreground">Total Budget</h3>
            <p className="text-sm text-muted-foreground">Sätt din totala bröllopsbudget</p>
          </div>
          <Dialog open={showBudgetSettings} onOpenChange={setShowBudgetSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Ändra budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Budgetinställningar</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Total budget (SEK)</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={overallBudget}
                    onChange={(e) => setOverallBudget(Number(e.target.value.replace(/\D/g, '')) || 0)}
                    className="mt-1"
                  />
                </div>
                <Button onClick={() => setShowBudgetSettings(false)} className="w-full">
                  Spara
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-4xl font-serif font-bold text-foreground">
          {formatCurrency(overallBudget)}
        </p>
        {estimatedDifference < 0 && (
          <p className="text-sm text-destructive mt-2">
            ⚠️ Uppskattade kostnader överstiger budget med {formatCurrency(Math.abs(estimatedDifference))}
          </p>
        )}
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 shadow-card border border-border"
        >
          <p className="text-sm text-muted-foreground mb-1">Uppskattad Kostnad</p>
          <p className="text-2xl font-serif font-semibold text-foreground">
            {formatCurrency(totalEstimated)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-6 shadow-card border border-border"
        >
          <p className="text-sm text-muted-foreground mb-1">Betalat Hittills</p>
          <p className="text-2xl font-serif font-semibold text-foreground">
            {formatCurrency(totalActual)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "rounded-xl p-6 shadow-card border",
            budgetDifference >= 0
              ? "bg-sage/10 border-sage"
              : "bg-destructive/10 border-destructive"
          )}
        >
          <p className="text-sm text-muted-foreground mb-1">Kvar av Budget</p>
          <div className="flex items-center gap-2">
            {budgetDifference >= 0 ? (
              <TrendingUp className="w-5 h-5 text-sage-dark" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive" />
            )}
            <p
              className={cn(
                "text-2xl font-serif font-semibold",
                budgetDifference >= 0 ? "text-sage-dark" : "text-destructive"
              )}
            >
              {formatCurrency(Math.abs(budgetDifference))}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl p-6 shadow-card border border-border"
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-foreground">Budgetanvändning</span>
          <span className="text-sm text-muted-foreground">
            {overallBudget > 0 ? Math.round((totalActual / overallBudget) * 100) : 0}%
          </span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              totalActual <= overallBudget ? "bg-gold-gradient" : "bg-destructive"
            )}
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min((totalActual / overallBudget) * 100, 100)}%`,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-3">
        <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Lägg till post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lägg till budgetpost</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Namn</Label>
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="T.ex. Bröllopsfotograf"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Kategori</Label>
                <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Välj kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Uppskattad kostnad (SEK)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newItemEstimated}
                  onChange={(e) => setNewItemEstimated(e.target.value.replace(/\D/g, ''))}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <Button onClick={addItem} className="w-full" disabled={!newItemName || !newItemCategory}>
                Lägg till
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Ny kategori
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lägg till kategori</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Kategorinamn</Label>
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="T.ex. Dekorationer"
                  className="mt-1"
                />
              </div>
              <Button onClick={addCategory} className="w-full" disabled={!newCategoryName}>
                Lägg till
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Items by Category */}
      <div className="space-y-4">
        {categories.map((category, categoryIndex) => {
          const categoryItems = groupedByCategory[category] || [];
          const categoryTotal = categoryItems.reduce((sum, i) => sum + i.estimated, 0);
          const categoryActual = categoryItems.reduce((sum, i) => sum + i.actual, 0);

          if (categoryItems.length === 0 && !defaultCategories.includes(category)) {
            return null;
          }

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + categoryIndex * 0.1 }}
              className="bg-card rounded-xl shadow-card border border-border overflow-hidden"
            >
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        categoryColors[category] || "bg-muted text-muted-foreground"
                      )}
                    >
                      {category}
                    </span>
                    {!defaultCategories.includes(category) && categoryItems.length === 0 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-6 h-6"
                        onClick={() => deleteCategory(category)}
                      >
                        <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(categoryTotal)}
                    </span>
                    {categoryActual > 0 && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({formatCurrency(categoryActual)} betalat)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="divide-y divide-border">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
                  >
                    {editingItemId === item.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1"
                          placeholder="Namn"
                        />
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={editEstimated}
                          onChange={(e) => setEditEstimated(e.target.value.replace(/\D/g, ''))}
                          className="w-32"
                          placeholder="Budget"
                        />
                        <Button size="icon" variant="ghost" onClick={() => updateItem(item.id)}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditingItemId(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Budget: {formatCurrency(item.estimated)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {editingId === item.id ? (
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={item.actual || ""}
                              onChange={(e) => updateActual(item.id, Number(e.target.value.replace(/\D/g, '')) || 0)}
                              onBlur={() => setEditingId(null)}
                              onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                              className="w-28 px-3 py-2 text-right rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                              autoFocus
                              placeholder="0"
                            />
                          ) : (
                            <button
                              onClick={() => setEditingId(item.id)}
                              className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                item.actual > 0
                                  ? "bg-sage/20 text-sage-dark hover:bg-sage/30"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              )}
                            >
                              {item.actual > 0 ? formatCurrency(item.actual) : "Lägg till"}
                            </button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8"
                            onClick={() => {
                              setEditingItemId(item.id);
                              setEditName(item.name);
                              setEditEstimated(item.estimated.toString());
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8"
                            onClick={() => deleteItem(item.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {categoryItems.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Inga poster i denna kategori
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
