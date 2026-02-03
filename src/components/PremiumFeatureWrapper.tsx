import { ReactNode } from "react";
import { Crown, Lock, Sparkles, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureId, getFeatureById, PREMIUM_PACKAGE } from "@/lib/pricing";

interface PremiumFeatureWrapperProps {
  children: ReactNode;
  featureId: FeatureId;
  hasAccess: boolean;
  onUnlock: (featureId: FeatureId) => void;
  onBuyPackage: () => void;
}

export function PremiumFeatureWrapper({
  children,
  featureId,
  hasAccess,
  onUnlock,
  onBuyPackage,
}: PremiumFeatureWrapperProps) {
  const feature = getFeatureById(featureId);
  
  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Demo content with blur */}
      <div className="pointer-events-none select-none filter blur-[2px] opacity-60">
        {children}
      </div>

      {/* Overlay with unlock options */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm rounded-xl">
        <div className="bg-card rounded-2xl p-6 shadow-xl border border-border max-w-sm mx-4 text-center">
          <div className="w-14 h-14 rounded-xl bg-gold-light flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-accent" />
          </div>
          
          <h3 className="font-serif text-xl font-medium text-foreground mb-2">
            {feature?.name || "Premium-funktion"}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-6">
            Lås upp denna funktion för att se dina faktiska beräkningar och data.
          </p>

          <div className="space-y-3">
            {/* Buy individual feature */}
            <Button 
              variant="outline"
              className="w-full gap-2"
              onClick={() => onUnlock(featureId)}
            >
              <ShoppingCart className="w-4 h-4" />
              Köp {feature?.name} – {feature?.price} kr
            </Button>

            {/* Buy package - best value */}
            <Button 
              className="w-full gap-2"
              onClick={onBuyPackage}
            >
              <Crown className="w-4 h-4" />
              Alla funktioner – {PREMIUM_PACKAGE.price} kr
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            Engångsköp, ingen prenumeration
          </p>
        </div>
      </div>
    </div>
  );
}
