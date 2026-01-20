import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Circle, Calendar, ChevronDown, ChevronUp, Pencil, Plus, Trash2, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  task: string;
  deadline: string;
  completed: boolean;
  timeframe: string;
}

interface ChecklistCategory {
  id: string;
  title: string;
  timeframe: string;
  items: ChecklistItem[];
}

const defaultCategories: ChecklistCategory[] = [
  {
    id: "12-months",
    title: "12+ Månader Innan",
    timeframe: "Börja i god tid",
    items: [
      { id: "1", task: "Bestäm budget", deadline: "Första steget", completed: false, timeframe: "12-months" },
      { id: "2", task: "Boka festlokal", deadline: "Viktigt att boka tidigt", completed: false, timeframe: "12-months" },
      { id: "3", task: "Boka fotograf", deadline: "Populära bokas snabbt", completed: false, timeframe: "12-months" },
      { id: "4", task: "Skapa gästlista", deadline: "Preliminär lista", completed: false, timeframe: "12-months" },
    ],
  },
  {
    id: "6-9-months",
    title: "6-9 Månader Innan",
    timeframe: "Planera detaljerna",
    items: [
      { id: "5", task: "Boka kyrka/vigselförrättare", deadline: "Kontrollera tillgänglighet", completed: false, timeframe: "6-9-months" },
      { id: "6", task: "Beställ bröllopsklänning", deadline: "Behöver tid för ändringar", completed: false, timeframe: "6-9-months" },
      { id: "7", task: "Boka catering/mat", deadline: "Diskutera meny", completed: false, timeframe: "6-9-months" },
      { id: "8", task: "Boka band/DJ", deadline: "Underhållning", completed: false, timeframe: "6-9-months" },
    ],
  },
  {
    id: "3-6-months",
    title: "3-6 Månader Innan",
    timeframe: "Detaljplanering",
    items: [
      { id: "9", task: "Skicka Save the Date", deadline: "Till gästerna", completed: false, timeframe: "3-6-months" },
      { id: "10", task: "Boka florist", deadline: "Blommor och dekorationer", completed: false, timeframe: "3-6-months" },
      { id: "11", task: "Välj bröllopstårta", deadline: "Provsmaka!", completed: false, timeframe: "3-6-months" },
      { id: "12", task: "Beställ vigselringar", deadline: "Kan ta tid att tillverka", completed: false, timeframe: "3-6-months" },
    ],
  },
  {
    id: "1-3-months",
    title: "1-3 Månader Innan",
    timeframe: "Slutspurten",
    items: [
      { id: "13", task: "Skicka inbjudningar", deadline: "2-3 månader före", completed: false, timeframe: "1-3-months" },
      { id: "14", task: "Boka transport", deadline: "Bil, buss etc.", completed: false, timeframe: "1-3-months" },
      { id: "15", task: "Planera bordsplacering", deadline: "När OSA inkommit", completed: false, timeframe: "1-3-months" },
      { id: "16", task: "Provning av klänning", deadline: "Sista justeringar", completed: false, timeframe: "1-3-months" },
    ],
  },
];

interface WeddingChecklistProps {
  onProgressChange?: (completed: number) => void;
}

export function WeddingChecklist({ onProgressChange }: WeddingChecklistProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["12-months"]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editTask, setEditTask] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null);
  const [newTask, setNewTask] = useState("");
  const [newDeadline, setNewDeadline] = useState("");

  // Fetch checklist items from database
  const fetchItems = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const mappedItems: ChecklistItem[] = data.map((item) => ({
          id: item.id,
          task: item.task,
          deadline: item.deadline || "",
          completed: item.completed,
          timeframe: item.timeframe || item.category,
        }));
        setItems(mappedItems);
      } else {
        // Initialize with default items
        await initializeDefaultItems();
      }
    } catch (error) {
      console.error("Error fetching checklist:", error);
      toast.error("Kunde inte hämta checklista");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const initializeDefaultItems = async () => {
    if (!user) return;

    const allItems = defaultCategories.flatMap((cat) =>
      cat.items.map((item) => ({
        user_id: user.id,
        task: item.task,
        deadline: item.deadline,
        completed: false,
        category: cat.id,
        timeframe: item.timeframe,
      }))
    );

    try {
      const { data, error } = await supabase
        .from("checklists")
        .insert(allItems)
        .select();

      if (error) throw error;

      if (data) {
        const mappedItems: ChecklistItem[] = data.map((item) => ({
          id: item.id,
          task: item.task,
          deadline: item.deadline || "",
          completed: item.completed,
          timeframe: item.timeframe || item.category,
        }));
        setItems(mappedItems);
      }
    } catch (error) {
      console.error("Error initializing checklist:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Notify parent of progress changes
  useEffect(() => {
    const completed = items.filter((item) => item.completed).length;
    onProgressChange?.(completed);
  }, [items, onProgressChange]);

  const toggleItem = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const newCompleted = !item.completed;

    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, completed: newCompleted } : i))
    );

    try {
      const { error } = await supabase
        .from("checklists")
        .update({ completed: newCompleted })
        .eq("id", itemId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating item:", error);
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, completed: !newCompleted } : i))
      );
      toast.error("Kunde inte uppdatera uppgift");
    }
  };

  const startEditing = (item: ChecklistItem) => {
    setEditingItem(item.id);
    setEditTask(item.task);
    setEditDeadline(item.deadline);
  };

  const saveEdit = async () => {
    if (!editingItem || !editTask.trim()) return;

    const originalItem = items.find((i) => i.id === editingItem);
    if (!originalItem) return;

    setItems((prev) =>
      prev.map((i) =>
        i.id === editingItem ? { ...i, task: editTask, deadline: editDeadline } : i
      )
    );
    setEditingItem(null);

    try {
      const { error } = await supabase
        .from("checklists")
        .update({ task: editTask, deadline: editDeadline })
        .eq("id", editingItem);

      if (error) throw error;
      toast.success("Uppgift uppdaterad!");
    } catch (error) {
      console.error("Error saving edit:", error);
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem
            ? { ...i, task: originalItem.task, deadline: originalItem.deadline }
            : i
        )
      );
      toast.error("Kunde inte spara ändringar");
    }
  };

  const deleteItem = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    setItems((prev) => prev.filter((i) => i.id !== itemId));

    try {
      const { error } = await supabase.from("checklists").delete().eq("id", itemId);

      if (error) throw error;
      toast.success("Uppgift borttagen!");
    } catch (error) {
      console.error("Error deleting item:", error);
      setItems((prev) => [...prev, item]);
      toast.error("Kunde inte ta bort uppgift");
    }
  };

  const addNewItem = async (categoryId: string) => {
    if (!user || !newTask.trim()) return;

    try {
      const { data, error } = await supabase
        .from("checklists")
        .insert({
          user_id: user.id,
          task: newTask,
          deadline: newDeadline || "Ingen deadline",
          completed: false,
          category: categoryId,
          timeframe: categoryId,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setItems((prev) => [
          ...prev,
          {
            id: data.id,
            task: data.task,
            deadline: data.deadline || "",
            completed: data.completed,
            timeframe: data.timeframe || data.category,
          },
        ]);
        setNewTask("");
        setNewDeadline("");
        setAddingToCategory(null);
        toast.success("Ny uppgift tillagd!");
      }
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Kunde inte lägga till uppgift");
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Group items by timeframe
  const groupedItems = items.reduce((acc, item) => {
    const key = item.timeframe || "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const categories = defaultCategories.map((cat) => ({
    ...cat,
    items: groupedItems[cat.id] || [],
  }));

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-xl h-24 animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category, categoryIndex) => {
        const completed = category.items.filter((i) => i.completed).length;
        const total = category.items.length;
        const progress = total > 0 ? (completed / total) * 100 : 0;
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
                    {completed}/{total}
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
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg transition-all",
                          item.completed
                            ? "bg-sage/20 border border-sage"
                            : "bg-muted/30 hover:bg-muted/50 border border-transparent"
                        )}
                      >
                        {editingItem === item.id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <Input
                              value={editTask}
                              onChange={(e) => setEditTask(e.target.value)}
                              className="flex-1"
                              placeholder="Uppgift"
                            />
                            <Input
                              value={editDeadline}
                              onChange={(e) => setEditDeadline(e.target.value)}
                              className="w-40"
                              placeholder="Deadline"
                            />
                            <Button size="icon" variant="ghost" onClick={saveEdit}>
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setEditingItem(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div
                              onClick={() => toggleItem(item.id)}
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer",
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
                            <div
                              className="flex-1 cursor-pointer"
                              onClick={() => toggleItem(item.id)}
                            >
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
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="w-8 h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditing(item);
                                }}
                              >
                                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="w-8 h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteItem(item.id);
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}

                    {/* Add new item */}
                    {addingToCategory === category.id ? (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-4 rounded-lg bg-muted/30 border border-dashed border-border"
                      >
                        <Input
                          value={newTask}
                          onChange={(e) => setNewTask(e.target.value)}
                          className="flex-1"
                          placeholder="Ny uppgift..."
                          autoFocus
                        />
                        <Input
                          value={newDeadline}
                          onChange={(e) => setNewDeadline(e.target.value)}
                          className="w-40"
                          placeholder="Deadline"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => addNewItem(category.id)}
                          disabled={!newTask.trim()}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setAddingToCategory(null);
                            setNewTask("");
                            setNewDeadline("");
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setAddingToCategory(category.id)}
                        className="w-full p-3 rounded-lg border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Lägg till uppgift</span>
                      </button>
                    )}
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
