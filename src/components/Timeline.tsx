import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Check, Clock, AlertCircle } from "lucide-react";
import { differenceInDays, format, addMonths, subMonths, isAfter, isBefore, isToday } from "date-fns";
import { sv } from "date-fns/locale";

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  monthsBefore: number;
  category: string;
  completed: boolean;
}

const defaultTimelineItems: Omit<TimelineItem, "id" | "completed">[] = [
  { title: "Bestäm budget", description: "Sätt en realistisk totalbudget för bröllopet", monthsBefore: 12, category: "Planering" },
  { title: "Välj datum och lokal", description: "Boka festlokal och eventuellt vigselplats", monthsBefore: 12, category: "Lokal" },
  { title: "Skapa gästlista", description: "Gör en första utkast av gästlistan", monthsBefore: 10, category: "Gäster" },
  { title: "Boka fotograf", description: "Hitta och boka en bröllopsfotograf", monthsBefore: 10, category: "Leverantörer" },
  { title: "Välj tema och färger", description: "Bestäm stil och färgschema för bröllopet", monthsBefore: 9, category: "Planering" },
  { title: "Boka catering/mat", description: "Välj och boka cateringföretag eller restaurang", monthsBefore: 8, category: "Mat & Dryck" },
  { title: "Beställ brudklänning", description: "Börja leta och beställ klänning i god tid", monthsBefore: 8, category: "Kläder" },
  { title: "Boka musik/DJ", description: "Anlita DJ eller liveband för festen", monthsBefore: 6, category: "Underhållning" },
  { title: "Skicka Save the date", description: "Skicka ut save the date-kort till gästerna", monthsBefore: 6, category: "Gäster" },
  { title: "Boka florist", description: "Välj florist för buketter och dekorationer", monthsBefore: 5, category: "Leverantörer" },
  { title: "Planera smekmånad", description: "Boka resa och boende för smekmånaden", monthsBefore: 4, category: "Planering" },
  { title: "Skicka inbjudningar", description: "Skicka ut formella inbjudningar med OSA", monthsBefore: 3, category: "Gäster" },
  { title: "Provning av mat", description: "Gå på provning hos cateringföretaget", monthsBefore: 2, category: "Mat & Dryck" },
  { title: "Slutgiltiga anpassningar", description: "Sista provning av brudklänning och kostym", monthsBefore: 1, category: "Kläder" },
  { title: "Bekräfta alla bokningar", description: "Ring och bekräfta alla leverantörer", monthsBefore: 1, category: "Planering" },
  { title: "Gör bordsplacering", description: "Planera var alla gäster ska sitta", monthsBefore: 0.5, category: "Gäster" },
];

interface TimelineProps {
  weddingDate: Date;
}

export function Timeline({ weddingDate }: TimelineProps) {
  const [items, setItems] = useState<TimelineItem[]>([]);

  useEffect(() => {
    // Load completed status from localStorage
    const savedCompleted = localStorage.getItem("timeline_completed");
    const completedIds = savedCompleted ? JSON.parse(savedCompleted) : [];

    const timelineItems = defaultTimelineItems.map((item, index) => ({
      ...item,
      id: `timeline-${index}`,
      completed: completedIds.includes(`timeline-${index}`),
    }));

    setItems(timelineItems);
  }, []);

  const toggleCompleted = (id: string) => {
    setItems((prevItems) => {
      const newItems = prevItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      
      // Save to localStorage
      const completedIds = newItems.filter((item) => item.completed).map((item) => item.id);
      localStorage.setItem("timeline_completed", JSON.stringify(completedIds));
      
      return newItems;
    });
  };

  const getDeadlineDate = (monthsBefore: number) => {
    return subMonths(weddingDate, monthsBefore);
  };

  const getStatus = (monthsBefore: number, completed: boolean) => {
    if (completed) return "completed";
    const deadlineDate = getDeadlineDate(monthsBefore);
    const today = new Date();
    
    if (isAfter(today, deadlineDate)) return "overdue";
    if (differenceInDays(deadlineDate, today) <= 14) return "upcoming";
    return "pending";
  };

  const daysUntilWedding = differenceInDays(weddingDate, new Date());

  const groupedItems = items.reduce((acc, item) => {
    const status = getStatus(item.monthsBefore, item.completed);
    if (!acc[status]) acc[status] = [];
    acc[status].push(item);
    return acc;
  }, {} as Record<string, TimelineItem[]>);

  const completedCount = items.filter((item) => item.completed).length;
  const progressPercent = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Wedding countdown */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-xl font-medium text-foreground">
              Nedräkning till bröllopet
            </h3>
            <p className="text-muted-foreground text-sm">
              {format(weddingDate, "d MMMM yyyy", { locale: sv })}
            </p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-serif font-medium text-primary">
              {daysUntilWedding}
            </span>
            <p className="text-muted-foreground text-sm">dagar kvar</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Framsteg</span>
            <span className="font-medium text-foreground">
              {completedCount} av {items.length} uppgifter
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Overdue items */}
      {groupedItems.overdue && groupedItems.overdue.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-lg font-medium text-destructive">
            <AlertCircle className="w-5 h-5" />
            Försenade uppgifter
          </h3>
          <div className="space-y-3">
            {groupedItems.overdue.map((item) => (
              <TimelineCard
                key={item.id}
                item={item}
                deadlineDate={getDeadlineDate(item.monthsBefore)}
                status="overdue"
                onToggle={toggleCompleted}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming items */}
      {groupedItems.upcoming && groupedItems.upcoming.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-lg font-medium text-gold">
            <Clock className="w-5 h-5" />
            Snart deadline
          </h3>
          <div className="space-y-3">
            {groupedItems.upcoming.map((item) => (
              <TimelineCard
                key={item.id}
                item={item}
                deadlineDate={getDeadlineDate(item.monthsBefore)}
                status="upcoming"
                onToggle={toggleCompleted}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending items */}
      {groupedItems.pending && groupedItems.pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-lg font-medium text-foreground">
            <Calendar className="w-5 h-5" />
            Kommande uppgifter
          </h3>
          <div className="space-y-3">
            {groupedItems.pending.map((item) => (
              <TimelineCard
                key={item.id}
                item={item}
                deadlineDate={getDeadlineDate(item.monthsBefore)}
                status="pending"
                onToggle={toggleCompleted}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed items */}
      {groupedItems.completed && groupedItems.completed.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-lg font-medium text-primary">
            <Check className="w-5 h-5" />
            Avklarade uppgifter
          </h3>
          <div className="space-y-3">
            {groupedItems.completed.map((item) => (
              <TimelineCard
                key={item.id}
                item={item}
                deadlineDate={getDeadlineDate(item.monthsBefore)}
                status="completed"
                onToggle={toggleCompleted}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface TimelineCardProps {
  item: TimelineItem;
  deadlineDate: Date;
  status: "overdue" | "upcoming" | "pending" | "completed";
  onToggle: (id: string) => void;
}

function TimelineCard({ item, deadlineDate, status, onToggle }: TimelineCardProps) {
  const statusStyles = {
    overdue: "border-destructive/50 bg-destructive/5",
    upcoming: "border-gold/50 bg-gold/5",
    pending: "border-border",
    completed: "border-primary/50 bg-primary/5 opacity-75",
  };

  const daysUntil = differenceInDays(deadlineDate, new Date());

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card rounded-xl p-4 shadow-sm border ${statusStyles[status]} cursor-pointer hover:shadow-md transition-all`}
      onClick={() => onToggle(item.id)}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
            status === "completed"
              ? "bg-primary border-primary"
              : "border-muted-foreground/30"
          }`}
        >
          {status === "completed" && <Check className="w-4 h-4 text-primary-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className={`font-medium ${status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {item.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                {item.description}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded">
              {item.category}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              {format(deadlineDate, "d MMMM yyyy", { locale: sv })}
            </span>
            {status === "overdue" && (
              <span className="text-destructive font-medium">
                ({Math.abs(daysUntil)} dagar sen)
              </span>
            )}
            {status === "upcoming" && (
              <span className="text-gold font-medium">
                ({daysUntil} dagar kvar)
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
