import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Circle, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  task: string;
  deadline: string;
  completed: boolean;
}

interface ChecklistCategory {
  id: string;
  title: string;
  timeframe: string;
  items: ChecklistItem[];
}

const initialChecklist: ChecklistCategory[] = [
  {
    id: "12-months",
    title: "12+ Månader Innan",
    timeframe: "Börja i god tid",
    items: [
      { id: "1", task: "Bestäm budget", deadline: "Första steget", completed: false },
      { id: "2", task: "Boka festlokal", deadline: "Viktigt att boka tidigt", completed: false },
      { id: "3", task: "Boka fotograf", deadline: "Populära bokas snabbt", completed: false },
      { id: "4", task: "Skapa gästlista", deadline: "Preliminär lista", completed: false },
    ],
  },
  {
    id: "6-9-months",
    title: "6-9 Månader Innan",
    timeframe: "Planera detaljerna",
    items: [
      { id: "5", task: "Boka kyrka/vigselförrättare", deadline: "Kontrollera tillgänglighet", completed: false },
      { id: "6", task: "Beställ bröllopsklänning", deadline: "Behöver tid för ändringar", completed: false },
      { id: "7", task: "Boka catering/mat", deadline: "Diskutera meny", completed: false },
      { id: "8", task: "Boka band/DJ", deadline: "Underhållning", completed: false },
    ],
  },
  {
    id: "3-6-months",
    title: "3-6 Månader Innan",
    timeframe: "Detaljplanering",
    items: [
      { id: "9", task: "Skicka Save the Date", deadline: "Till gästerna", completed: false },
      { id: "10", task: "Boka florist", deadline: "Blommor och dekorationer", completed: false },
      { id: "11", task: "Välj bröllopstårta", deadline: "Provsmaka!", completed: false },
      { id: "12", task: "Beställ vigselringar", deadline: "Kan ta tid att tillverka", completed: false },
    ],
  },
  {
    id: "1-3-months",
    title: "1-3 Månader Innan",
    timeframe: "Slutspurten",
    items: [
      { id: "13", task: "Skicka inbjudningar", deadline: "2-3 månader före", completed: false },
      { id: "14", task: "Boka transport", deadline: "Bil, buss etc.", completed: false },
      { id: "15", task: "Planera bordsplacering", deadline: "När OSA inkommit", completed: false },
      { id: "16", task: "Provning av klänning", deadline: "Sista justeringar", completed: false },
    ],
  },
];

interface WeddingChecklistProps {
  onProgressChange?: (completed: number) => void;
}

export function WeddingChecklist({ onProgressChange }: WeddingChecklistProps) {
  const [checklist, setChecklist] = useState<ChecklistCategory[]>(initialChecklist);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["12-months"]);

  const toggleItem = (categoryId: string, itemId: string) => {
    setChecklist((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              ),
            }
          : category
      )
    );
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getCategoryProgress = (category: ChecklistCategory) => {
    const completed = category.items.filter((item) => item.completed).length;
    return (completed / category.items.length) * 100;
  };

  // Calculate total completed and notify parent
  useEffect(() => {
    const totalCompleted = checklist.reduce(
      (sum, category) => sum + category.items.filter((item) => item.completed).length,
      0
    );
    onProgressChange?.(totalCompleted);
  }, [checklist, onProgressChange]);

  return (
    <div className="space-y-4">
      {checklist.map((category, categoryIndex) => {
        const progress = getCategoryProgress(category);
        const isExpanded = expandedCategories.includes(category.id);

        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
            className="bg-card rounded-xl shadow-card overflow-hidden border border-border"
          >
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full p-5 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-sage-light flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-serif text-lg font-medium text-foreground">
                    {category.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{category.timeframe}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-sm font-medium text-foreground">
                    {category.items.filter((i) => i.completed).length}/{category.items.length}
                  </span>
                  <div className="w-24 h-2 bg-muted rounded-full mt-1 overflow-hidden">
                    <motion.div
                      className="h-full bg-gold-gradient rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-border"
                >
                  <div className="p-4 space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: itemIndex * 0.05 }}
                        onClick={() => toggleItem(category.id, item.id)}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all",
                          item.completed
                            ? "bg-sage/20 border border-sage"
                            : "bg-muted/30 hover:bg-muted/50 border border-transparent"
                        )}
                      >
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                            item.completed
                              ? "bg-sage-dark text-sage-dark"
                              : "border-2 border-muted-foreground"
                          )}
                        >
                          {item.completed ? (
                            <Check className="w-4 h-4 text-card" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground opacity-0" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p
                            className={cn(
                              "font-medium transition-all",
                              item.completed
                                ? "text-muted-foreground line-through"
                                : "text-foreground"
                            )}
                          >
                            {item.task}
                          </p>
                          <p className="text-sm text-muted-foreground">{item.deadline}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
