import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Är det verkligen gratis att använda MittBröllop.se?",
    a: "Ja! Checklista, gästlista, budgetverktyg och nedräkning är helt gratis — utan tidsbegränsning. Ni kan uppgradera till Premium när som helst för att låsa upp avancerade verktyg.",
  },
  {
    q: "Vad ingår i Premium?",
    a: "Premium ger tillgång till en egen bröllopshemsida, dryckeskalkylator, matkalkylator, visuell bordsplacering och Excel-export av gästlistan. Allt för en engångskostnad på 199 kr.",
  },
  {
    q: "Kan jag köpa enskilda funktioner?",
    a: "Absolut. Varje premiumfunktion kan köpas separat för 79 kr styck om ni inte behöver hela paketet.",
  },
  {
    q: "Hur fungerar bröllopshemsidan?",
    a: "Ni skapar en personlig hemsida med er information, datum, plats, bildgalleri och RSVP-formulär. Era gäster kan besöka hemsidan och anmäla sig direkt.",
  },
  {
    q: "Sparas min data säkert?",
    a: "Ja, all data lagras krypterat i molnet och är kopplad till ert konto. Ni kan logga in från vilken enhet som helst och er information finns kvar.",
  },
  {
    q: "Fungerar det på mobilen?",
    a: "Absolut! MittBröllop.se är fullt responsivt och fungerar lika bra på mobil, surfplatta och dator.",
  },
];

export function FAQSection() {
  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 bg-card/50" id="faq">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-foreground mb-4">
            Vanliga frågor
          </h2>
          <p className="text-lg text-muted-foreground">
            Allt du undrar om MittBröllop.se
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5 text-sm sm:text-base">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed text-sm sm:text-base">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

/** JSON-LD for FAQ rich results */
export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Är det verkligen gratis att använda MittBröllop.se?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja! Checklista, gästlista, budgetverktyg och nedräkning är helt gratis — utan tidsbegränsning.",
        },
      },
      {
        "@type": "Question",
        name: "Vad ingår i Premium?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Premium ger tillgång till en egen bröllopshemsida, dryckeskalkylator, matkalkylator, visuell bordsplacering och Excel-export av gästlistan. Allt för en engångskostnad på 199 kr.",
        },
      },
      {
        "@type": "Question",
        name: "Kan jag köpa enskilda funktioner?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolut. Varje premiumfunktion kan köpas separat för 79 kr styck.",
        },
      },
      {
        "@type": "Question",
        name: "Hur fungerar bröllopshemsidan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ni skapar en personlig hemsida med er information, datum, plats, bildgalleri och RSVP-formulär. Era gäster kan besöka hemsidan och anmäla sig direkt.",
        },
      },
      {
        "@type": "Question",
        name: "Sparas min data säkert?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja, all data lagras krypterat i molnet och är kopplad till ert konto.",
        },
      },
      {
        "@type": "Question",
        name: "Fungerar det på mobilen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolut! MittBröllop.se är fullt responsivt och fungerar lika bra på mobil, surfplatta och dator.",
        },
      },
    ],
  };
}
