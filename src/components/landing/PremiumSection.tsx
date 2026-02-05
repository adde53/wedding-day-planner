import { motion } from "framer-motion";
import { Crown, Wine, UtensilsCrossed, Table2, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface PremiumSectionProps {
  onOpenPremiumGate: () => void;
}

export function PremiumSection({ onOpenPremiumGate }: PremiumSectionProps) {
  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6" id="premium">
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
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mb-4">
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
              className="bg-card rounded-2xl p-8 shadow-sm border-2 border-gold/20 hover:border-gold/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-gold-light/60 to-transparent rounded-bl-3xl flex items-end justify-start p-2">
                <Crown className="w-4 h-4 text-accent" />
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold-light to-terracotta-light flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
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
            <p className="text-sm text-muted-foreground mb-2">Premium Paket — Engångsköp</p>
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
            className="relative w-full gap-2 shadow-lg shadow-primary/20 h-12"
            onClick={onOpenPremiumGate}
          >
            <Crown className="w-4 h-4" />
            Köp Premium – 199 kr
          </Button>
          <p className="text-xs text-muted-foreground mt-3 text-center">Eller 79 kr per funktion</p>
        </motion.div>
      </div>
    </section>
  );
}
