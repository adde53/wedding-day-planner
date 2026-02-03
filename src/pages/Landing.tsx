import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  Heart, 
  CheckSquare, 
  Wallet, 
  Users,
  ArrowRight, 
  Sparkles,
  Wine,
  UtensilsCrossed,
  Table2,
  Crown,
  Check,
  Globe,
  MessageCircle,
  Lightbulb,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { SupportDialog } from "@/components/SupportDialog";
import { usePremium } from "@/hooks/usePremium";
import { TrialBanner } from "@/components/TrialBanner";
import { PremiumGate } from "@/components/PremiumGate";
import { useState } from "react";
import { FeatureId } from "@/lib/pricing";

const freeFeatures = [
  {
    icon: CheckSquare,
    title: "Bröllopschecklista",
    description: "Komplett checklista med 16+ uppgifter sorterade efter tidslinje. Håll koll på alla detaljer.",
    free: true,
  },
  {
    icon: Users,
    title: "Gästlista & RSVP",
    description: "Hantera era gäster, spåra svar och håll koll på allergier och matpreferenser.",
    free: true,
  },
  {
    icon: Wallet,
    title: "Budgetverktyg",
    description: "Planera och följ upp era utgifter i realtid. Se alltid hur ni ligger till mot er budget.",
    free: true,
  },
  {
    icon: Heart,
    title: "Nedräkning",
    description: "Se hur många dagar det är kvar till er stora dag med vår vackra nedräkning.",
    free: true,
  },
];

const premiumFeatures = [
  {
    icon: Globe,
    title: "Bröllopshemsida",
    description: "Skapa en vacker hemsida för era gäster med RSVP, bildgalleri och all praktisk info.",
  },
  {
    icon: Wine,
    title: "Dryckeskalkylator",
    description: "Beräkna exakt hur mycket champagne, vin och öl ni behöver — med prisestimat.",
  },
  {
    icon: UtensilsCrossed,
    title: "Matkalkylator",
    description: "Få matmängder och cateringpriser för buffé, sittande middag eller cocktailmingel.",
  },
  {
    icon: Table2,
    title: "Bordsplacering",
    description: "Skapa bord och placera era gäster visuellt. Exportera till PDF för tryck.",
  },
];

const stats = [
  { value: "16+", label: "Checklistuppgifter" },
  { value: "Gratis", label: "Grundversion" },
  { value: "199 kr", label: "Alla Premium" },
];

export default function Landing() {
  const auth = useAuth();
  const { user } = auth;
  const navigate = useNavigate();
  const { isTrialActive, trialDaysLeft, activatePremium, purchaseFeature, startTrial, hasUsedTrial, isProcessingPayment } = usePremium();
  const showBanner = !!user && isTrialActive && trialDaysLeft > 0;

  const [premiumGateOpen, setPremiumGateOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const fn = (auth as any).logout ?? (auth as any).signOut ?? (auth as any).logOut;
      if (typeof fn === "function") {
        await fn();
      } else {
        console.warn("No logout function available on useAuth()");
      }
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {showBanner && (
        <TrialBanner
          daysLeft={trialDaysLeft}
          onUpgradeClick={() => setPremiumGateOpen(true)}
        />
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-6xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 sm:gap-3"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/20">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <h1 className="font-serif text-base sm:text-xl font-medium text-foreground">
                <span className="hidden xs:inline">MittBröllop</span>
                <span className="xs:hidden">MittBröllop</span>
              </h1>
            </motion.div>
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link to="/guider">
                <Button variant="ghost" size="sm" className="gap-1 text-xs sm:text-sm px-2 sm:px-3">
                  <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Guider</span>
                </Button>
              </Link>
              {user ? (
                <>
                  <Link to="/dashboard">
                    <Button size="sm" className="bg-primary text-xs sm:text-sm px-2.5 sm:px-4">
                      <span className="hidden xs:inline">Dashboard</span>
                      <span className="xs:hidden">Planera</span>
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="px-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" className="hidden xs:block">
                    <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                      Logga in
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="sm" className="bg-primary text-xs sm:text-sm px-2.5 sm:px-4">
                      <span className="hidden xs:inline">Kom igång</span>
                      <span className="xs:hidden">Skapa konto</span>
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sage-light/30 via-transparent to-transparent" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-gold-light/30 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border shadow-sm mb-8">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-muted-foreground">
                Sveriges smidigaste bröllopsplanerare
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-foreground mb-6 leading-tight">
              Planera ert
              <span className="block text-primary"> drömBröllop</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Allt ni behöver för att skapa ett perfekt bröllop. Checklista, gästlista, budget 
              och smarta kalkylatorer — helt gratis att börja.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 text-base px-8">
                  Börja planera gratis
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/guider">
                <Button variant="outline" size="lg" className="gap-2 text-base">
                  <Lightbulb className="w-4 h-4" />
                  Läs våra guider
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-4xl font-serif font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Free Features Section */}
      <section className="py-20 px-4 sm:px-6 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-sage-light px-4 py-2 rounded-full mb-6">
              <Check className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Helt gratis</span>
            </div>
            <h2 className="font-serif text-4xl font-medium text-foreground mb-4">
              Allt du behöver för att komma igång
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Börja planera ert bröllop utan kostnad. Uppgradera till Premium när ni vill ha mer.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {freeFeatures.map((feature, i) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-sage-light to-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                >
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-medium text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-gold-light px-4 py-2 rounded-full mb-6">
              <Crown className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Premium</span>
            </div>
            <h2 className="font-serif text-4xl font-medium text-foreground mb-4">
              Avancerade verktyg för perfekt planering
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Få tillgång till alla avancerade verktyg för en engångskostnad på 199 kr — eller köp enskilda funktioner för 79 kr styck.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {premiumFeatures.map((feature, i) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card rounded-2xl p-8 shadow-sm border-2 border-gold/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-gold-light to-transparent rounded-bl-3xl flex items-end justify-start p-2">
                  <Crown className="w-5 h-5 text-accent" />
                </div>
                <div
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold-light to-terracotta-light flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                >
                  <feature.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-serif text-2xl font-medium text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.article>
            ))}
          </div>

          {/* Pricing Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto bg-card rounded-2xl p-8 shadow-xl border-2 border-gold/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold-light/30 via-transparent to-rose-light/20 pointer-events-none" />
            <div className="relative text-center mb-6">
              <p className="text-sm text-muted-foreground mb-2">Premium Paket - Engångsköp</p>
              <p className="text-5xl font-serif font-bold text-foreground">199 kr</p>
              <p className="text-sm text-muted-foreground mt-2">
                <span className="line-through">395 kr</span> om köpt separat — spara 196 kr!
              </p>
            </div>
            <ul className="relative space-y-3 mb-8">
              {[
                "Egen bröllopshemsida med gästkoder",
                "Dryckeskalkylator med prisestimat",
                "Matkalkylator med cateringpriser",
                "Bordsplacering för alla gäster",
                "Exportera gästlista till Excel",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              className="relative w-full gap-2 shadow-lg shadow-primary/20"
              onClick={() => setPremiumGateOpen(true)}
            >
              <Crown className="w-4 h-4" />
              Köp Premium – 199 kr
            </Button>
            <p className="text-xs text-muted-foreground mt-3 text-center">Eller 79 kr per funktion</p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-3xl p-12 text-center shadow-2xl shadow-primary/30 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/5 rounded-full blur-3xl" />

            <div
              className="relative w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-6"
            >
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>

            <h2 className="relative font-serif text-3xl sm:text-4xl font-medium text-primary-foreground mb-4">
              Börja planera ert drömBröllop
            </h2>
            <p className="relative text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Skapa ett konto gratis och börja planera redan idag. 
              Alla grundverktyg är helt gratis.
            </p>
            <Link to="/auth">
              <Button
                size="lg"
                variant="secondary"
                className="relative gap-2 shadow-lg text-base px-8"
              >
                Kom igång gratis
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/50 border-t border-border py-10 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-medium text-foreground">
                MittBröllop.se
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <Link
                to="/guider"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Guider & Tips
              </Link>
              <Link
                to="/brollopsinfo"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Bröllopsinfo
              </Link>
              <SupportDialog>
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4" />
                  Support
                </button>
              </SupportDialog>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-left">
              © 2025 MittBröllop.se
            </p>
          </div>
        </div>
      </footer>

      {/* Premium Gate Modal */}
      <PremiumGate
        isOpen={premiumGateOpen}
        onClose={() => setPremiumGateOpen(false)}
        featureName="Premium"
        featureId="premium_package"
        hasUsedTrial={hasUsedTrial}
        isProcessingPayment={isProcessingPayment}
        onUpgrade={() => {
          activatePremium();
        }}
        onPurchaseFeature={(featureId) => {
          purchaseFeature(featureId);
        }}
        onStartTrial={() => {
          startTrial();
          setPremiumGateOpen(false);
        }}
      />
    </div>
  );
}
