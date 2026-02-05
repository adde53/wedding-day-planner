import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { usePremium } from "@/hooks/usePremium";
import { TrialBanner } from "@/components/TrialBanner";
import { PremiumGate } from "@/components/PremiumGate";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { FreeFeaturesSection } from "@/components/landing/FreeFeaturesSection";
import { PremiumSection } from "@/components/landing/PremiumSection";
import { FAQSection, faqJsonLd } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Landing() {
  const { user } = useAuth();
  const { isTrialActive, trialDaysLeft, activatePremium, purchaseFeature, startTrial, hasUsedTrial, isProcessingPayment } = usePremium();
  const showBanner = !!user && isTrialActive && trialDaysLeft > 0;

  const [premiumGateOpen, setPremiumGateOpen] = useState(false);

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd())}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {showBanner && (
          <TrialBanner
            daysLeft={trialDaysLeft}
            onUpgradeClick={() => setPremiumGateOpen(true)}
          />
        )}

        <LandingHeader />

        <main>
          <HeroSection />
          <FreeFeaturesSection />
          <PremiumSection onOpenPremiumGate={() => setPremiumGateOpen(true)} />
          <FAQSection />
          <CTASection />
        </main>

        <LandingFooter />

        <PremiumGate
          isOpen={premiumGateOpen}
          onClose={() => setPremiumGateOpen(false)}
          featureName="Premium"
          featureId="premium_package"
          hasUsedTrial={hasUsedTrial}
          isProcessingPayment={isProcessingPayment}
          onUpgrade={() => activatePremium()}
          onPurchaseFeature={(featureId) => purchaseFeature(featureId)}
          onStartTrial={() => {
            startTrial();
            setPremiumGateOpen(false);
          }}
        />
      </div>
    </>
  );
}
