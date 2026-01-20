import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Calendar, CheckCircle2, Clock, Pencil } from "lucide-react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ProgressOverviewProps {
  weddingDate: Date;
  completedTasks: number;
  totalTasks: number;
  onWeddingDateChange?: (date: Date) => void;
}

export function ProgressOverview({
  weddingDate,
  completedTasks,
  totalTasks,
  onWeddingDateChange,
}: ProgressOverviewProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const today = new Date();
  const daysUntilWedding = Math.ceil(
    (weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const handleDateSelect = (date: Date | undefined) => {
    if (date && onWeddingDateChange) {
      onWeddingDateChange(date);
      setIsCalendarOpen(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-2xl shadow-elevated border border-border p-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* Countdown */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-light mb-4">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Nedräkning</span>
          </div>
          <h2 className="text-5xl font-serif font-bold text-foreground mb-2">
            {daysUntilWedding > 0 ? daysUntilWedding : 0}
          </h2>
          <p className="text-muted-foreground">dagar kvar till bröllopet</p>
          
          {/* Editable Wedding Date */}
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <button className="mt-3 group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(weddingDate, "EEEE d MMMM yyyy", { locale: sv })}
                </span>
                <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={weddingDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < today}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Circular Progress */}
        <div className="flex justify-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--gold))" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-serif font-bold text-foreground">
                {Math.round(progressPercentage)}%
              </span>
              <span className="text-xs text-muted-foreground">Klart</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-sage/10 border border-sage/30">
            <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-sage-dark" />
            </div>
            <div>
              <p className="text-2xl font-serif font-semibold text-foreground">
                {completedTasks}
              </p>
              <p className="text-sm text-muted-foreground">Avklarade uppgifter</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-gold-light/50 border border-gold/30">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-serif font-semibold text-foreground">
                {totalTasks - completedTasks}
              </p>
              <p className="text-sm text-muted-foreground">Återstående</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
