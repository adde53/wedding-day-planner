import { motion } from "framer-motion";
import { Crown, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PremiumGateProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  onUpgrade?: () => void;
}

const premiumFeatures = [
  "Dryckeskalkylator med prisestimat",
  "Matkalkylator med cateringpriser",
  "Bordsplacering för alla gäster",
  "Exportera gästlista till Excel",
  "Obegränsad tillgång till alla verktyg",
];

export function PremiumGate({ isOpen, onClose, featureName, onUpgrade }: PremiumGateProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gold-light flex items-center justify-center">
              <Crown className="w-8 h-8 text-accent" />
            </div>
            Uppgradera till Premium
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-center text-muted-foreground">
            <span className="font-medium text-foreground">{featureName}</span> är en premiumfunktion. 
            Uppgradera för att få tillgång till alla avancerade verktyg.
          </p>

          <div className="bg-muted/30 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-foreground mb-3">Med Premium får du:</p>
            {premiumFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-gold-light rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Engångsbetalning</p>
            <p className="text-3xl font-serif font-bold text-foreground">199 kr</p>
            <p className="text-xs text-muted-foreground">Livstids tillgång</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              size="lg" 
              className="w-full gap-2"
              onClick={onUpgrade}
            >
              <Crown className="w-4 h-4" />
              Uppgradera nu
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-muted-foreground"
            >
              Kanske senare
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
