import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Calendar, CheckCircle2, Clock, Pencil, Users, UserCheck, UserX } from "lucide-react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface GuestStats {
  confirmed: number;
  declined: number;
  pending: number;
  total: number;
}

interface ProgressOverviewProps {
  weddingDate: Date;
  completedTasks: number;
  totalTasks: number;
  guestStats?: GuestStats;
  onWeddingDateChange?: (date: Date) => void;
}

export function ProgressOverview({
  weddingDate,
  completedTasks,
  totalTasks,
  guestStats,
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
      className="bg-card rounded-2xl shadow-elevated border border-border p-8 relative overflow-hidden"
    >
      {/* Subtle decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-light/30 via-transparent to-sage-light/40 pointer-events-none" />
      
      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* Countdown */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-rose-light to-gold-light mb-4 shadow-sm">
            <Heart className="w-4 h-4 text-rose" />
            <span className="text-sm font-medium text-rose">Nedräkning</span>
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
          {/* Guest Stats */}
          {guestStats && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-terracotta-light border border-primary/20 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-serif font-semibold text-foreground">
                    {guestStats.total}
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1 text-primary">
                      <UserCheck className="w-4 h-4" />
                      {guestStats.confirmed}
                    </span>
                    <span className="flex items-center gap-1 text-rose">
                      <UserX className="w-4 h-4" />
                      {guestStats.declined}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Gäster bjudna</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-sage-light to-primary/5 border border-sage/20 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-serif font-semibold text-foreground">
                {completedTasks}
              </p>
              <p className="text-sm text-muted-foreground">Avklarade uppgifter</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gold-light to-terracotta-light border border-gold/20 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center">
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
