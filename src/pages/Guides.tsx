import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Wallet, 
  Users,
  ArrowRight, 
  Lightbulb,
  Wine,
  UtensilsCrossed,
  Table2,
  CheckSquare,
  Globe,
  MessageCircle,
  Calendar,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { SupportDialog } from "@/components/SupportDialog";

const guides = [
  {
    id: "budget",
    icon: Wallet,
    title: "Bröllopsbudget – så här räknar du rätt",
    intro: "Att ha koll på budgeten är nyckeln till ett stressfritt bröllop.",
    steps: [
      "Lista alla kostnader: lokal, mat, dryck, kläder, dekorationer, musik.",
      "Prioritera: Vad är viktigast för er?",
      "Använd vår bröllopsbudget-kalkylator för att räkna ut exakta summor per kategori.",
      "Uppdatera löpande när ni bokar leverantörer."
    ],
    tip: "Lämna alltid lite extra i budgeten för oväntade utgifter.",
    cta: "Testa budgetkalkylatorn gratis",
    ctaLink: "/auth?redirect=budget",
    dashboardTab: "budget"
  },
  {
    id: "seating",
    icon: Table2,
    title: "Bordsplacering – skapa perfekta sittplatser",
    intro: "Rätt bordsplacering gör gästerna glada och stämningen bättre.",
    steps: [
      "Lista alla gäster och notera relationer (familj, vänner, kollegor).",
      "Gruppdynamik: placera personer med liknande intressen tillsammans.",
      "Använd vår interaktiva bordsplacerare för att se layouten visuellt."
    ],
    tip: "Testa olika scenarion innan ni bestämmer slutgiltigt.",
    cta: "Prova bordsplaceraren",
    ctaLink: "/auth?redirect=tables",
    dashboardTab: "tables"
  },
  {
    id: "rsvp",
    icon: Users,
    title: "RSVP & Gästlista – håll koll på alla svar",
    intro: "En smidig gästlista sparar tid och stress.",
    steps: [
      "Skapa en digital gästlista.",
      "Skicka RSVP-länkar direkt via e-post eller delbar länk.",
      "Följ upp automatiskt med gäster som inte svarat."
    ],
    tip: "Dela gästlistan med bröllopsteamet (t.ex. brudtärnor, familj) för enklare koordinering.",
    cta: "Hantera gästlistan online",
    ctaLink: "/auth?redirect=guests",
    dashboardTab: "guests"
  },
  {
    id: "food-drinks",
    icon: Wine,
    title: "Dryck & Mat – räkna rätt för alla gäster",
    intro: "Att ha rätt mängd mat och dryck är enkelt med våra verktyg.",
    steps: [
      "Räkna antalet vuxna och barn, samt särskilda behov (vegan, allergier).",
      "Använd vår dryckes- och matkalkylator för att räkna exakt mängd dryck och mat.",
      "Planera proportioner för mingel, middag och bar."
    ],
    tip: "Lämna alltid lite extra dryck för säkerhets skull – gäster gillar variation!",
    cta: "Prova dryckes- och matkalkylatorn",
    ctaLink: "/auth?redirect=drinks",
    dashboardTab: "drinks"
  },
  {
    id: "checklist",
    icon: CheckSquare,
    title: "Checklista för bröllopsplanering",
    intro: "En enkel checklista hjälper er att hålla koll på allt från start till fest.",
    milestones: [
      { time: "12 månader innan", task: "sätt budget, boka lokal" },
      { time: "6 månader innan", task: "boka fotograf, catering, kläder" },
      { time: "3 månader innan", task: "skicka inbjudningar, börja med bordsplacering" },
      { time: "1 månad innan", task: "dubbelkolla RSVP, beställ dekor, planera meny" }
    ],
    tip: "Ladda ner vår kompletta checklista för att följa steg-för-steg.",
    cta: "Ladda ner checklista gratis",
    ctaLink: "/auth?redirect=checklist",
    dashboardTab: "checklist"
  },
  {
    id: "website",
    icon: Globe,
    title: "Skapa er egen bröllopswebbplats",
    intro: "Vill ni ha en personlig sida med info för gäster?",
    features: [
      "Visa schema, plats, RSVP-länk och bilder",
      "Låt gästerna hitta all info på ett ställe",
      "Skapa enkelt via vårt bröllopswebbverktyg"
    ],
    tip: "Håll designen enkel och använd bilder från er förlovning eller tidigare events.",
    cta: "Skapa bröllopswebbplats gratis",
    ctaLink: "/auth?redirect=website",
    dashboardTab: "website"
  }
];

export default function Guides() {
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
      <section className="pt-32 pb-16 px-4 sm:px-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-40 left-10 w-64 h-64 bg-rose-light/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-60 right-10 w-72 h-72 bg-gold-light/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-1/3 w-48 h-48 bg-sage-light/60 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-rose-light to-gold-light border border-rose/20 mb-6 shadow-sm">
              <Lightbulb className="w-4 h-4 text-rose" />
              <span className="text-sm font-medium text-rose">
                Guider & Tips
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground leading-tight mb-6"
          >
            Planera ditt
            <span className="block text-gradient-sage">drömbröllop</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Här hittar du guider och verktyg som hjälper dig planera ditt bröllop enkelt och roligt. 
            Från budget och RSVP till bordsplacering och dryckesplanering – allt på ett ställe.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link to="/auth">
              <Button size="lg" className="h-12 sm:h-14 px-6 sm:px-8 bg-primary hover:bg-primary/90 text-base sm:text-lg shadow-lg shadow-primary/25">
                Kom igång gratis
                <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Guides Section */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {guides.map((guide, index) => (
            <motion.article
              key={guide.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="bg-card rounded-2xl p-6 sm:p-8 shadow-sm border border-border hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-sage-light to-primary/10 flex items-center justify-center flex-shrink-0">
                  <guide.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {index + 1}.
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-medium text-foreground leading-tight">
                    {guide.title}
                  </h2>
                </div>
              </div>

              <p className="text-muted-foreground mb-6 text-base sm:text-lg">
                {guide.intro}
              </p>

              {/* Steps list */}
              {guide.steps && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-foreground mb-3">Steg-för-steg:</p>
                  <ol className="space-y-2 ml-4">
                    {guide.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Features list for website section */}
              {guide.features && (
                <ul className="space-y-2 mb-6">
                  {guide.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              {/* Milestones for checklist */}
              {guide.milestones && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-foreground mb-3">Exempel på viktiga steg:</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {guide.milestones.map((milestone, i) => (
                      <div 
                        key={i} 
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
                      >
                        <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                        <div>
                          <span className="text-sm font-medium text-foreground">{milestone.time}:</span>
                          <span className="text-sm text-muted-foreground ml-1">{milestone.task}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tip box */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-gold-light/50 to-terracotta-light/30 border border-gold/20 mb-6">
                <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                  <span className="font-medium">Tips:</span> {guide.tip}
                </p>
              </div>

              {/* CTA Button */}
              <Link to={guide.ctaLink}>
                <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">
                  {guide.cta}
                  {guide.id === "checklist" ? (
                    <Download className="ml-2 w-4 h-4" />
                  ) : (
                    <ArrowRight className="ml-2 w-4 h-4" />
                  )}
                </Button>
              </Link>
            </motion.article>
          ))}
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
            className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-3xl p-8 sm:p-12 text-center shadow-2xl shadow-primary/30 relative overflow-hidden"
          >
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
            
            <div className="relative w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="relative font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-primary-foreground mb-4">
              Redo att börja planera?
            </h2>
            <p className="relative text-base sm:text-lg text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Skapa ett gratis konto och ta första steget mot ert drömbröllop. 
              Alla verktyg ni behöver finns här.
            </p>
            <Link to="/auth">
              <Button size="lg" className="relative h-12 sm:h-14 px-8 sm:px-10 bg-card text-foreground hover:bg-card/90 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all">
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
              <div className="w-10 h-10 rounded-lg bg-sage-gradient flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-serif text-lg font-medium text-foreground">
                MittBröllop.se
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Startsida
              </Link>
              <SupportDialog>
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4" />
                  Kontakta support
                </button>
              </SupportDialog>
              <p className="text-sm text-muted-foreground">
                © 2025 MittBröllop.se
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
