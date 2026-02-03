import { Crown, Check, ArrowRight, Sparkles, Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PREMIUM_PACKAGE, INDIVIDUAL_FEATURES, PACKAGE_SAVINGS, FeatureId, getFeatureById } from "@/lib/pricing";

interface PremiumGateProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  featureId?: FeatureId;
  onUpgrade?: () => void;
  onPurchaseFeature?: (featureId: FeatureId) => void;
  onStartTrial?: () => void;
  hasUsedTrial?: boolean;
  isProcessingPayment?: boolean;
}

export function PremiumGate({ 
  isOpen, 
  onClose, 
  featureName, 
  featureId,
  onUpgrade,
  onPurchaseFeature,
  onStartTrial,
  hasUsedTrial = false,
  isProcessingPayment = false
}: PremiumGateProps) {
  const currentFeature = featureId ? getFeatureById(featureId) : null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-center flex flex-col items-center gap-3 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-gold-light flex items-center justify-center">
              <Crown className="w-8 h-8 text-accent" />
            </div>
            Lås upp {featureName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-center text-muted-foreground">
            <span className="font-medium text-foreground">{featureName}</span> är en premiumfunktion. 
            Välj hur du vill låsa upp den.
          </p>

          {/* Free Trial Section */}
          {!hasUsedTrial && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium text-primary">Prova gratis i 7 dagar!</p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Alla funktioner, inget kort krävs</p>
              <Button 
                variant="outline"
                className="w-full gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={onStartTrial}
                disabled={isProcessingPayment}
              >
                <Sparkles className="w-4 h-4" />
                Starta gratis provperiod
              </Button>
            </div>
          )}

          {/* Buy individual feature */}
          {currentFeature && currentFeature.id !== 'premium_package' && (
            <div className="bg-muted/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-foreground">Köp endast {currentFeature.name}</p>
                  <p className="text-xs text-muted-foreground">{currentFeature.description}</p>
                </div>
                <p className="text-xl font-serif font-bold text-foreground">{currentFeature.price} kr</p>
              </div>
              <Button 
                variant="outline"
                className="w-full gap-2"
                onClick={() => onPurchaseFeature?.(currentFeature.id)}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Laddar...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Köp för {currentFeature.price} kr
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Divider */}
          {currentFeature && currentFeature.id !== 'premium_package' && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">eller spara {PACKAGE_SAVINGS} kr</span>
              </div>
            </div>
          )}

          {/* Premium Package - Best value */}
          <div className="bg-gold-light rounded-xl p-4 border-2 border-gold">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-4 h-4 text-accent" />
                  <p className="font-medium text-foreground">Premium Paket</p>
                  <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">Bäst värde</span>
                </div>
                <p className="text-xs text-muted-foreground">Alla 5 funktioner för alltid</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-serif font-bold text-foreground">{PREMIUM_PACKAGE.price} kr</p>
                <p className="text-xs text-muted-foreground line-through">{INDIVIDUAL_FEATURES.reduce((sum, f) => sum + f.price, 0)} kr</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {INDIVIDUAL_FEATURES.map((feature) => (
                <div key={feature.id} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-foreground">{feature.name}</span>
                </div>
              ))}
            </div>

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
                  Köp Premium – {PREMIUM_PACKAGE.price} kr
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Engångsbetalning via Stripe. Swish & kort accepteras.
          </p>
          
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full text-muted-foreground"
            disabled={isProcessingPayment}
          >
            Kanske senare
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
