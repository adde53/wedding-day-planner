import { motion } from "framer-motion";
import { CheckSquare, Users, Wallet, Heart, Check } from "lucide-react";

const freeFeatures = [
  {
    icon: CheckSquare,
    title: "Bröllopschecklista",
    description: "Komplett checklista med 16+ uppgifter sorterade efter tidslinje. Håll koll på alla detaljer.",
  },
  {
    icon: Users,
    title: "Gästlista & RSVP",
    description: "Hantera era gäster, spåra svar och håll koll på allergier och matpreferenser.",
  },
  {
    icon: Wallet,
    title: "Budgetverktyg",
    description: "Planera och följ upp era utgifter i realtid. Se alltid hur ni ligger till mot er budget.",
  },
  {
    icon: Heart,
    title: "Nedräkning",
    description: "Se hur många dagar det är kvar till er stora dag med vår vackra nedräkning.",
  },
];

export function FreeFeaturesSection() {
  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 bg-card/50" id="funktioner">
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
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mb-4">
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
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sage-light to-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-primary" />
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
      </div>
    </section>
  );
}
