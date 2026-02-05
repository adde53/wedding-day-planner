import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Lightbulb, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "16+", label: "Checklistuppgifter" },
  { value: "Gratis", label: "Grundversion" },
  { value: "199 kr", label: "Alla Premium" },
];

export function HeroSection() {
  return (
    <section className="pt-28 sm:pt-36 pb-20 sm:pb-28 px-4 sm:px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-gold-light/30 rounded-full blur-3xl" />
      <div className="absolute top-40 right-1/4 w-48 h-48 bg-rose-light/40 rounded-full blur-3xl" />

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

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-foreground mb-6 leading-tight tracking-tight">
            Planera ert
            <span className="block text-primary mt-1"> drömbröllop</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Allt ni behöver för att skapa ett perfekt bröllop — checklista, gästlista, budget 
            och smarta kalkylatorer. <strong className="text-foreground">Helt gratis att börja.</strong>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 text-base px-8 h-12">
                Börja planera gratis
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/guider">
              <Button variant="outline" size="lg" className="gap-2 text-base h-12">
                <Lightbulb className="w-4 h-4" />
                Läs våra guider
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-8 flex items-center justify-center gap-1 text-sm text-muted-foreground"
          >
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-gold text-gold" />
              ))}
            </div>
            <span className="ml-2">Uppskattat av hundratals bröllopspar</span>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50">
              <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
