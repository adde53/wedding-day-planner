import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-primary via-primary to-primary/90 rounded-3xl p-10 sm:p-14 text-center shadow-2xl shadow-primary/30 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-40 h-40 bg-primary-foreground/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-primary-foreground/5 rounded-full blur-3xl" />

          <div className="relative w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>

          <h2 className="relative font-serif text-3xl sm:text-4xl font-medium text-primary-foreground mb-4">
            Börja planera ert drömbröllop
          </h2>
          <p className="relative text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Skapa ett konto gratis och börja planera redan idag. 
            Alla grundverktyg är helt gratis — för alltid.
          </p>
          <Link to="/auth">
            <Button
              size="lg"
              variant="secondary"
              className="relative gap-2 shadow-lg text-base px-8 h-12"
            >
              Kom igång gratis
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
