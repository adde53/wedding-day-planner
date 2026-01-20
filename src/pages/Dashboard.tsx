import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { usePremium } from "@/hooks/usePremium";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ProgressOverview } from "@/components/ProgressOverview";
import { WeddingChecklist } from "@/components/WeddingChecklist";
import { BudgetTracker } from "@/components/BudgetTracker";
import { GuestList } from "@/components/GuestList";
import { SettingsPanel } from "@/components/SettingsPanel";
import { DrinkCalculator } from "@/components/DrinkCalculator";
import { FoodCalculator } from "@/components/FoodCalculator";
import { VisualTablePlanner } from "@/components/VisualTablePlanner";
import { PremiumGate } from "@/components/PremiumGate";
import { Heart, Sparkles, Calendar, Wallet, CheckSquare, Settings, Users, Wine, UtensilsCrossed, Table2, Crown } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { profile, updateWeddingDate } = useProfile();
  const { isPremium, activatePremium } = usePremium();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [completedTasks, setCompletedTasks] = useState(0);
  const [guestStats, setGuestStats] = useState({ confirmed: 0, declined: 0, pending: 0, total: 0 });
  const [premiumGateOpen, setPremiumGateOpen] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState("");
  const totalTasks = 16;

  const handleGuestStatsChange = useCallback((confirmed: number, declined: number, pending: number, total: number) => {
    setGuestStats({ confirmed, declined, pending, total });
  }, []);

  // Get wedding date from profile or use default (8 months from now)
  const weddingDate = profile?.wedding_date
    ? new Date(profile.wedding_date)
    : (() => {
        const date = new Date();
        date.setMonth(date.getMonth() + 8);
        return date;
      })();

  const handleWeddingDateChange = useCallback(
    (date: Date) => {
      updateWeddingDate(date);
    },
    [updateWeddingDate]
  );

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Laddar...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-subtle">
      <DashboardHeader 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        guestCount={{ confirmed: guestStats.confirmed, total: guestStats.total }}
        isPremium={isPremium}
        onPremiumClick={(featureName) => {
          setPremiumFeatureName(featureName);
          setPremiumGateOpen(true);
        }}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Welcome Section */}
              <section className="bg-card rounded-2xl p-8 shadow-sm border border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-gold" />
                      <span className="text-sm font-medium text-gold">
                        Välkommen tillbaka
                      </span>
                    </div>
                    <h1 className="font-serif text-3xl font-medium text-foreground mb-2">
                      Ert bröllop närmar sig
                    </h1>
                    <p className="text-muted-foreground">
                      Fortsätt planera och håll koll på alla detaljer.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("settings")}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Settings className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </section>

              {/* Progress Overview */}
              <ProgressOverview
                weddingDate={weddingDate}
                completedTasks={completedTasks}
                totalTasks={totalTasks}
                guestStats={guestStats}
                onWeddingDateChange={handleWeddingDateChange}
              />

              {/* Quick Actions */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => setActiveTab("guests")}
                  className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                    Gästlista
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {guestStats.confirmed} av {guestStats.total} bekräftade
                  </p>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  onClick={() => setActiveTab("checklist")}
                  className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-sage-light flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <CheckSquare className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                    Checklista
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {totalTasks - completedTasks} uppgifter kvar
                  </p>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => setActiveTab("budget")}
                  className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold-light flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Wallet className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                    Budget
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Hantera era utgifter
                  </p>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-taupe-light flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Calendar className="w-6 h-6 text-taupe" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                    Tidslinje
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Se alla deadlines
                  </p>
                </motion.button>
              </section>

              {/* Info Card */}
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-card rounded-2xl p-8 shadow-sm border border-border text-center"
              >
                <Heart className="w-10 h-10 text-primary mx-auto mb-4" />
                <h2 className="font-serif text-2xl font-medium text-foreground mb-3">
                  Ert bröllop, er stil
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Varje bröllop är unikt. Använd våra verktyg för att planera
                  precis det bröllop ni drömmer om.
                </p>
              </motion.section>
            </motion.div>
          )}

          {activeTab === "checklist" && (
            <motion.div
              key="checklist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="font-serif text-3xl font-medium text-foreground mb-2">
                  Bröllopschecklista
                </h2>
                <p className="text-muted-foreground">
                  Klicka på uppgifter för att markera dem som klara
                </p>
              </div>
              <WeddingChecklist onProgressChange={setCompletedTasks} />
            </motion.div>
          )}

          {activeTab === "guests" && (
            <motion.div
              key="guests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="font-serif text-3xl font-medium text-foreground mb-2">
                  Gästlista
                </h2>
                <p className="text-muted-foreground">
                  Hantera era gäster och spåra RSVP-svar
                </p>
              </div>
              <GuestList onGuestStatsChange={handleGuestStatsChange} />
            </motion.div>
          )}

          {activeTab === "tables" && (
            <motion.div
              key="tables"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="font-serif text-3xl font-medium text-foreground mb-2">
                  Bordsplacering
                </h2>
                <p className="text-muted-foreground">
                  Skapa bord och placera era gäster
                </p>
              </div>
              <VisualTablePlanner confirmedGuests={guestStats.confirmed} />
            </motion.div>
          )}

          {activeTab === "budget" && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="font-serif text-3xl font-medium text-foreground mb-2">
                  Budgetplanerare
                </h2>
                <p className="text-muted-foreground">
                  Klicka på belopp för att uppdatera verkliga kostnader
                </p>
              </div>
              <BudgetTracker />
            </motion.div>
          )}

          {activeTab === "food" && (
            <motion.div
              key="food"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="font-serif text-3xl font-medium text-foreground mb-2">
                  Matkalkylator
                </h2>
                <p className="text-muted-foreground">
                  Beräkna matmängder och få prisestimat för catering
                </p>
              </div>
              <FoodCalculator confirmedGuests={guestStats.confirmed} />
            </motion.div>
          )}

          {activeTab === "drinks" && (
            <motion.div
              key="drinks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="font-serif text-3xl font-medium text-foreground mb-2">
                  Dryckeskalkylator
                </h2>
                <p className="text-muted-foreground">
                  Beräkna hur mycket dryck ni behöver baserat på antal gäster
                </p>
              </div>
              <DrinkCalculator confirmedGuests={guestStats.confirmed} weddingDate={weddingDate} />
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="font-serif text-3xl font-medium text-foreground mb-2">
                  Inställningar
                </h2>
                <p className="text-muted-foreground">
                  Hantera ert bröllop och era uppgifter
                </p>
              </div>
              <SettingsPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              <span className="font-serif text-lg font-medium text-foreground">
                DittBröllop.se
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Med kärlek, för er stora dag ❤️
            </p>
          </div>
        </div>
      </footer>

      {/* Premium Gate Modal */}
      <PremiumGate 
        isOpen={premiumGateOpen}
        onClose={() => setPremiumGateOpen(false)}
        featureName={premiumFeatureName}
        onUpgrade={() => {
          activatePremium();
          setPremiumGateOpen(false);
        }}
      />
    </div>
  );
}
