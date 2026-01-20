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
  Check
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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sage-gradient flex items-center justify-center shadow-sm">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-medium text-foreground">
                mittBröllop.se
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <Link to="/dashboard">
                  <Button className="bg-primary hover:bg-primary/90">
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
                    <Button className="bg-primary hover:bg-primary/90">
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
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-light border border-sage/20 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
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
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/auth">
                <Button size="lg" className="h-14 px-8 bg-primary hover:bg-primary/90 text-lg shadow-lg">
                  Skapa gratis konto
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#pricing">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-border">
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
      <section className="py-20 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-light border border-sage/20 mb-4">
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
                className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow"
              >
                <div 
                  className="w-14 h-14 rounded-xl bg-sage-light flex items-center justify-center mb-6"
                >
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-serif text-2xl font-medium text-foreground">
                    {feature.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sage-light text-primary">
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
      <section id="pricing" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-light border border-gold/30 mb-4">
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

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {premiumFeatures.map((feature, i) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card rounded-2xl p-8 shadow-sm border-2 border-gold/30 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gold-light rounded-bl-3xl flex items-end justify-start p-2">
                  <Crown className="w-5 h-5 text-accent" />
                </div>
                <div 
                  className="w-14 h-14 rounded-xl bg-gold-light flex items-center justify-center mb-6"
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
            className="max-w-md mx-auto bg-card rounded-2xl p-8 shadow-lg border-2 border-gold/30"
          >
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-2">Premium - Engångsbetalning</p>
              <p className="text-5xl font-serif font-bold text-foreground">199 kr</p>
              <p className="text-sm text-muted-foreground mt-2">Livstids tillgång</p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
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
              <Button size="lg" className="w-full gap-2">
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
            className="bg-sage-gradient rounded-3xl p-12 text-center shadow-xl"
          >
            <div 
              className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-6"
            >
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-primary-foreground mb-4">
              Redo att börja planera?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Skapa ett gratis konto och ta första steget mot ert drömbröllop. Uppgradera till Premium när ni är redo.
            </p>
            <Link to="/auth">
              <Button size="lg" className="h-14 px-10 bg-card text-foreground hover:bg-card/90 text-lg shadow-lg">
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
                mittBröllop.se
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 mittBröllop.se. Bröllopsplanering gjord enkel.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
