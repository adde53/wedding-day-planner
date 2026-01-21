import { motion } from "framer-motion";
import { Crown, Check, ArrowRight, Sparkles, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface PremiumGateProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  onUpgrade?: () => void;
  onStartTrial?: () => void;
  hasUsedTrial?: boolean;
  isProcessingPayment?: boolean;
}

const premiumFeatures = [
  "Dryckeskalkylator med prisestimat",
  "Matkalkylator med cateringpriser",
  "Bordsplacering för alla gäster",
  "Exportera gästlista till Excel",
  "Obegränsad tillgång till alla verktyg",
];

export function PremiumGate({ 
  isOpen, 
  onClose, 
  featureName, 
  onUpgrade,
  onStartTrial,
  hasUsedTrial = false,
  isProcessingPayment = false
}: PremiumGateProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
          disabled={isProcessingPayment}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Stäng</span>
        </button>
        
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-center flex flex-col items-center gap-3 pt-2">
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

          {/* Free Trial Section */}
          {!hasUsedTrial && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium text-primary">Prova gratis i 7 dagar!</p>
              </div>
              <p className="text-xs text-muted-foreground">Inget kort krävs</p>
            </div>
          )}

          <div className="bg-gold-light rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Engångsbetalning</p>
            <p className="text-3xl font-serif font-bold text-foreground">199 kr</p>
            <p className="text-xs text-muted-foreground">Livstids tillgång</p>
          </div>

          <div className="flex flex-col gap-3">
            {!hasUsedTrial && (
              <Button 
                size="lg" 
                variant="outline"
                className="w-full gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={onStartTrial}
                disabled={isProcessingPayment}
              >
                <Sparkles className="w-4 h-4" />
                Starta 7 dagars gratis provperiod
              </Button>
            )}
            <Button 
              size="lg" 
              className="w-full gap-2"
              onClick={onUpgrade}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Laddar...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4" />
                  Köp Premium – 199 kr
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Säker betalning via Stripe. Swish & kort accepteras.
            </p>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-muted-foreground"
              disabled={isProcessingPayment}
            >
              Kanske senare
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
