import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Heart, 
  CheckSquare, 
  Wallet, 
  Calendar, 
  ArrowRight, 
  Sparkles,
  Users,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: CheckSquare,
    title: "Checklista för bröllop",
    description: "Komplett bröllopschecklista med 16+ uppgifter sorterade efter tidslinje. Håll koll på alla detaljer från bokningar till sista förberedelser.",
  },
  {
    icon: Wallet,
    title: "Bröllopsbudgetverktyg",
    description: "Planera och följ upp era utgifter i realtid med vårt bröllopsbudgetverktyg. Se alltid hur ni ligger till mot er totala budget.",
  },
  {
    icon: Calendar,
    title: "Tidslinje & Påminnelser",
    description: "Visuell tidslinje med alla milstolpar för er bröllopsplanering. Missa aldrig en viktig deadline.",
  },
  {
    icon: TrendingUp,
    title: "Framstegsspårning",
    description: "Se ert framsteg med tydliga visualiseringar. Känn lugnet i att veta var ni står i er planering.",
  },
];

const stats = [
  { value: "16+", label: "Inbyggda uppgifter" },
  { value: "100%", label: "Gratis grundplan" },
  { value: "8", label: "Budgetkategorier" },
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
                Bröllopsplanerare
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <Link to="/dashboard">
                  <Button className="bg-primary hover:bg-primary/90">
                    Till Dashboard
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
                  Gratis bröllopsplaneringsverktyg
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-medium text-foreground leading-tight mb-6"
            >
              Planera bröllop
              <span className="block text-gradient-sage">online</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              Håll koll på varje detalj med vår smarta checklista för bröllop, 
              bröllopsbudgetverktyg och digital gästlista. Allt ni behöver för en stressfri bröllopsplanering.
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
              <Link to="/auth">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-border">
                  Se hur det fungerar
                </Button>
              </Link>
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

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl font-medium text-foreground mb-4">
              Allt för er bröllopsplanering
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Från första idén till er stora dag. Vi har samlat alla verktyg ni behöver för att planera bröllop online.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
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
                  role="img"
                  aria-label={feature.title}
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

      {/* How it Works */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl font-medium text-foreground mb-4">
              Så här fungerar det
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Kom igång på under en minut och börja planera bröllop direkt.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Skapa konto",
                description: "Registrera dig gratis och sätt ert bröllopsdatum.",
                icon: Users,
              },
              {
                step: "02",
                title: "Följ checklistan",
                description: "Använd vår bröllopschecklista för att bocka av uppgifter i rätt ordning.",
                icon: CheckSquare,
              },
              {
                step: "03",
                title: "Håll koll på budgeten",
                description: "Lägg in kostnader i bröllopsbudgetverktyget och se att ni håller er budget.",
                icon: Wallet,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="relative inline-block mb-6">
                  <div 
                    className="w-20 h-20 rounded-2xl bg-sage-gradient flex items-center justify-center shadow-lg"
                    role="img"
                    aria-label={item.title}
                  >
                    <item.icon className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gold text-accent-foreground font-bold text-sm flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
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
              role="img"
              aria-label="Hjärtikon för bröllopsplanering"
            >
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-primary-foreground mb-4">
              Redo att börja planera ert bröllop?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Skapa ett gratis konto och ta första steget mot ert drömbröllop med vårt gratis bröllopsplaneringsverktyg.
            </p>
            <Link to="/auth">
              <Button size="lg" className="h-14 px-10 bg-card text-foreground hover:bg-card/90 text-lg shadow-lg">
                Kom igång gratis
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
                role="img"
                aria-label="Bröllopsplanerare logo"
              >
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-serif text-lg font-medium text-foreground">
                Bröllopsplanerare
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Bröllopsplanerare. Gratis bröllopsplaneringsverktyg för er stora dag.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
