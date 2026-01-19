import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetItem {
  id: string;
  category: string;
  name: string;
  estimated: number;
  actual: number;
}

const initialBudgetItems: BudgetItem[] = [
  { id: "1", category: "Lokal", name: "Festlokal", estimated: 50000, actual: 0 },
  { id: "2", category: "Mat & Dryck", name: "Catering", estimated: 40000, actual: 0 },
  { id: "3", category: "Mat & Dryck", name: "Dryck & bar", estimated: 15000, actual: 0 },
  { id: "4", category: "Kläder", name: "Bröllopsklänning", estimated: 15000, actual: 0 },
  { id: "5", category: "Kläder", name: "Kostym", estimated: 8000, actual: 0 },
  { id: "6", category: "Foto & Video", name: "Fotograf", estimated: 20000, actual: 0 },
  { id: "7", category: "Blommor", name: "Florist", estimated: 10000, actual: 0 },
  { id: "8", category: "Musik", name: "Band/DJ", estimated: 15000, actual: 0 },
  { id: "9", category: "Övrigt", name: "Vigselringar", estimated: 12000, actual: 0 },
  { id: "10", category: "Övrigt", name: "Bröllopstårta", estimated: 5000, actual: 0 },
];

const categoryColors: Record<string, string> = {
  "Lokal": "bg-primary/20 text-primary",
  "Mat & Dryck": "bg-sage/30 text-sage-dark",
  "Kläder": "bg-gold-light text-accent-foreground",
  "Foto & Video": "bg-rose-light text-primary",
  "Blommor": "bg-secondary text-secondary-foreground",
  "Musik": "bg-muted text-muted-foreground",
  "Övrigt": "bg-champagne text-foreground",
};

export function BudgetTracker() {
  const [items, setItems] = useState<BudgetItem[]>(initialBudgetItems);
  const [editingId, setEditingId] = useState<string | null>(null);

  const totalEstimated = items.reduce((sum, item) => sum + item.estimated, 0);
  const totalActual = items.reduce((sum, item) => sum + item.actual, 0);
  const difference = totalEstimated - totalActual;

  const updateActual = (id: string, value: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, actual: value } : item
      )
    );
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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-6 shadow-card border border-border"
        >
          <p className="text-sm text-muted-foreground mb-1">Uppskattad Budget</p>
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
          <p className="text-sm text-muted-foreground mb-1">Verklig Kostnad</p>
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
            difference >= 0
              ? "bg-sage/10 border-sage"
              : "bg-destructive/10 border-destructive"
          )}
        >
          <p className="text-sm text-muted-foreground mb-1">Kvar av Budget</p>
          <div className="flex items-center gap-2">
            {difference >= 0 ? (
              <TrendingUp className="w-5 h-5 text-sage-dark" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive" />
            )}
            <p
              className={cn(
                "text-2xl font-serif font-semibold",
                difference >= 0 ? "text-sage-dark" : "text-destructive"
              )}
            >
              {formatCurrency(Math.abs(difference))}
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
            {totalEstimated > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0}%
          </span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              totalActual <= totalEstimated ? "bg-gold-gradient" : "bg-destructive"
            )}
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min((totalActual / totalEstimated) * 100, 100)}%`,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Budget Items by Category */}
      <div className="space-y-4">
        {Object.entries(groupedByCategory).map(([category, categoryItems], categoryIndex) => (
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
                </div>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrency(categoryItems.reduce((sum, i) => sum + i.estimated, 0))}
                </span>
              </div>
            </div>

            <div className="divide-y divide-border">
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Budget: {formatCurrency(item.estimated)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        value={item.actual || ""}
                        onChange={(e) => updateActual(item.id, Number(e.target.value))}
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
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
