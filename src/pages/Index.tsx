import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { ProgressOverview } from "@/components/ProgressOverview";
import { WeddingChecklist } from "@/components/WeddingChecklist";
import { BudgetTracker } from "@/components/BudgetTracker";
import { Heart, Sparkles, Calendar, Wallet, CheckSquare } from "lucide-react";
import weddingHero from "@/assets/wedding-hero.jpg";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Set wedding date to 8 months from now for demo
  const weddingDate = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 8);
    return date;
  }, []);

  // Demo task counts
  const totalTasks = 16;
  const [completedTasks] = useState(3);

  return (
    <div className="min-h-screen bg-romantic">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

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
              {/* Hero Section */}
              <section className="relative rounded-3xl overflow-hidden shadow-elevated">
                <div className="absolute inset-0">
                  <img
                    src={weddingHero}
                    alt="Wedding flowers"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
                </div>
                <div className="relative px-8 py-16 md:px-12 md:py-24">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-xl"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-gold" />
                      <span className="text-sm font-medium text-gold">
                        Välkommen till din bröllopsplanering
                      </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4 leading-tight">
                      Planera ert
                      <span className="block text-gradient-gold">drömm­bröllop</span>
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8">
                      Håll koll på varje detalj med vår smarta checklista, budgetverktyg
                      och tidslinje. Allt ni behöver för en stressfri planering.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={() => setActiveTab("checklist")}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-soft hover:shadow-card transition-all hover:-translate-y-0.5"
                      >
                        <CheckSquare className="w-5 h-5" />
                        Börja planera
                      </button>
                      <button
                        onClick={() => setActiveTab("budget")}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card text-foreground font-medium border border-border shadow-soft hover:shadow-card transition-all hover:-translate-y-0.5"
                      >
                        <Wallet className="w-5 h-5" />
                        Se budget
                      </button>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* Progress Overview */}
              <ProgressOverview
                weddingDate={weddingDate}
                completedTasks={completedTasks}
                totalTasks={totalTasks}
              />

              {/* Quick Stats */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-elevated transition-all cursor-pointer group"
                  onClick={() => setActiveTab("checklist")}
                >
                  <div className="w-12 h-12 rounded-xl bg-rose-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <CheckSquare className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                    Checklista
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    16 uppgifter sorterade efter tidslinje. Håll koll på alla detaljer.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-elevated transition-all cursor-pointer group"
                  onClick={() => setActiveTab("budget")}
                >
                  <div className="w-12 h-12 rounded-xl bg-gold-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Wallet className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                    Budgetverktyg
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Planera och följ upp era utgifter. Se alltid hur ni ligger till.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-card rounded-2xl p-6 shadow-card border border-border hover:shadow-elevated transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-sage/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-sage-dark" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                    Tidslinje
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Se alla deadlines och milstolpar. Missa aldrig en viktig detalj.
                  </p>
                </motion.div>
              </section>

              {/* Inspiration Section */}
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-card rounded-2xl p-8 shadow-card border border-border text-center"
              >
                <Heart className="w-10 h-10 text-primary mx-auto mb-4" />
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">
                  Ert bröllop, er stil
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Varje bröllop är unikt. Använd våra verktyg för att planera
                  precis det bröllop ni drömmer om - vare sig det är stort och
                  glamoröst eller intimt och personligt.
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
                <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
                  Bröllopschecklista
                </h2>
                <p className="text-muted-foreground">
                  Klicka på uppgifter för att markera dem som klara
                </p>
              </div>
              <WeddingChecklist />
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
                <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
                  Budgetplanerare
                </h2>
                <p className="text-muted-foreground">
                  Klicka på belopp för att uppdatera verkliga kostnader
                </p>
              </div>
              <BudgetTracker />
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
                Wedding Planner Pro
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Med kärlek, för er stora dag ❤️
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
