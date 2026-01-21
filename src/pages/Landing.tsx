import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

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
  { value: "199kr", label: "Premium engång" },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/20">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-medium text-foreground">
                MittBröllop.se
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <Link to="/dashboard">
                  <Button className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">
                    Min planering
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" className="text-foreground hover:text-primary">
                      Logga in
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">
                      Kom igång gratis
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-40 left-10 w-64 h-64 bg-rose-light/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-60 right-10 w-72 h-72 bg-gold-light/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-1/3 w-48 h-48 bg-sage-light/60 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-rose-light to-gold-light border border-rose/20 mb-6 shadow-sm">
                <Sparkles className="w-4 h-4 text-rose" />
                <span className="text-sm font-medium text-rose">
                  Sveriges smartaste bröllopsplanerare
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-medium text-foreground leading-tight mb-6"
            >
              Planera ert
              <span className="block text-gradient-sage">drömbröllop</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              Checklista, gästhantering, budget, mat- och dryckeskalkylatorer samt bordsplacering — allt på ett ställe. Börja gratis idag.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4"
            >
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 bg-primary hover:bg-primary/90 text-base sm:text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  Skapa gratis konto
                  <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5" />
                </Button>
              </Link>
              <a href="#pricing" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg border-border bg-card/50 backdrop-blur-sm hover:bg-card">
                  Se priser
                </Button>
              </a>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-serif font-medium text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Free Features Section */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-transparent via-muted/40 to-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sage-light to-primary/10 border border-primary/20 mb-4 shadow-sm">
              <Check className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Helt gratis</span>
            </div>
            <h2 className="font-serif text-4xl font-medium text-foreground mb-4">
              Allt ni behöver för att komma igång
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Våra gratisverktyg räcker långt. Använd checklistan, gästlistan och budgetverktyget utan kostnad.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
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
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-serif text-2xl font-medium text-foreground">
                    {feature.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    Gratis
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Features Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-muted/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-gold-light to-terracotta-light border border-gold/30 mb-4 shadow-sm">
              <Crown className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Premium</span>
            </div>
            <h2 className="font-serif text-4xl font-medium text-foreground mb-4">
              Avancerade verktyg för perfekt planering
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Få tillgång till våra smarta kalkylatorer och bordsplacering för 199 kr — en engångsbetalning.
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
              <p className="text-sm text-muted-foreground mb-2">Premium - Engångsbetalning</p>
              <p className="text-5xl font-serif font-bold text-foreground">199 kr</p>
              <p className="text-sm text-muted-foreground mt-2">Livstids tillgång</p>
            </div>
            <ul className="relative space-y-3 mb-8">
              {[
                "Egen bröllopshemsida med QR-koder",
                "Dryckeskalkylator med prisestimat",
                "Matkalkylator med cateringpriser", 
                "Bordsplacering för alla gäster",
                "Exportera gästlista till Excel",
                "Alla framtida uppdateringar",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/auth">
              <Button size="lg" className="relative w-full gap-2 shadow-lg shadow-primary/20">
                <Crown className="w-4 h-4" />
                Kom igång nu
              </Button>
            </Link>
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
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
            
            <div 
              className="relative w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-6"
            >
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="relative font-serif text-3xl sm:text-4xl font-medium text-primary-foreground mb-4">
              Redo att börja planera?
            </h2>
            <p className="relative text-lg text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Skapa ett gratis konto och ta första steget mot ert drömbröllop. Uppgradera till Premium när ni är redo.
            </p>
            <Link to="/auth">
              <Button size="lg" className="relative h-14 px-10 bg-card text-foreground hover:bg-card/90 text-lg shadow-lg hover:shadow-xl transition-all">
                Skapa gratis konto
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg bg-sage-gradient flex items-center justify-center"
              >
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-serif text-lg font-medium text-foreground">
                MittBröllop.se
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 MittBröllop.se. Bröllopsplanering gjord enkel.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
