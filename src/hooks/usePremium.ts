import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { FeatureId, INDIVIDUAL_FEATURES, PREMIUM_PACKAGE } from "@/lib/pricing";

const TRIAL_DURATION_DAYS = 7;

// Features included in premium package
const ALL_PREMIUM_FEATURES: FeatureId[] = [
  'drink_calculator',
  'food_calculator', 
  'table_planner',
  'excel_export',
  'wedding_website',
];

export function usePremium() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPremium, setIsPremium] = useState(false);
  const [purchasedFeatures, setPurchasedFeatures] = useState<string[]>([]);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const checkPremiumStatus = useCallback(async () => {
    if (!user) {
      setIsPremium(false);
      setPurchasedFeatures([]);
      setIsTrialActive(false);
      setTrialDaysLeft(0);
      setIsLoading(false);
      return;
    }

    // First check Stripe for paid premium
    try {
      const { data, error } = await supabase.functions.invoke('check-premium');
      
      if (!error && data) {
        if (data.isPremium) {
          setIsPremium(true);
          setPurchasedFeatures(data.purchasedFeatures || ALL_PREMIUM_FEATURES);
          setIsLoading(false);
          return;
        }
        // Store any features they have
        setPurchasedFeatures(data.purchasedFeatures || []);
      }
    } catch (e) {
      console.log("Could not check Stripe premium status, falling back to database");
    }

    // Check for active trial from database
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("trial_started_at")
        .eq("user_id", user.id)
        .single();

      if (!error && profile?.trial_started_at) {
        const trialStart = new Date(profile.trial_started_at);
        const now = new Date();
        const diffTime = now.getTime() - trialStart.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const daysLeft = TRIAL_DURATION_DAYS - diffDays;

        if (daysLeft > 0) {
          setIsPremium(true);
          setPurchasedFeatures(ALL_PREMIUM_FEATURES);
          setIsTrialActive(true);
          setTrialDaysLeft(daysLeft);
        } else {
          setIsPremium(purchasedFeatures.length > 0);
          setIsTrialActive(false);
          setTrialDaysLeft(0);
        }
      }
    } catch (e) {
      console.log("Could not check trial status from database");
    }

    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    checkPremiumStatus();
  }, [checkPremiumStatus]);

  // Check for payment success in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const featureId = urlParams.get('feature');
    
    if (paymentStatus === 'success' && user) {
      const featureName = featureId === 'premium_package' 
        ? 'Premium Paket'
        : INDIVIDUAL_FEATURES.find(f => f.id === featureId)?.name || 'funktionen';
      
      toast({
        title: "Betalning genomförd! 🎉",
        description: `Tack för ditt köp! Du har nu tillgång till ${featureName}.`,
      });
      // Refresh premium status
      checkPremiumStatus();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Betalning avbruten",
        description: "Din betalning avbröts. Du kan prova igen när som helst.",
        variant: "destructive",
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user, toast, checkPremiumStatus]);

  const initiatePayment = async (featureId: FeatureId = 'premium_package') => {
    if (!user) {
      toast({
        title: "Logga in först",
        description: "Du måste vara inloggad för att köpa.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { featureId }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.assign(data.url);
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setIsProcessingPayment(false);
      toast({
        title: "Något gick fel",
        description: "Kunde inte starta betalningen. Försök igen.",
        variant: "destructive",
      });
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      toast({
        title: "Logga in först",
        description: "Du måste vara inloggad för att hantera dina köp.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error("No portal URL received");
      }
    } catch (error) {
      console.error("Customer portal error:", error);
      toast({
        title: "Något gick fel",
        description: "Kunde inte öppna köphanteringen. Försök igen.",
        variant: "destructive",
      });
    }
  };

  const activatePremium = () => {
    initiatePayment('premium_package');
  };

  const purchaseFeature = (featureId: FeatureId) => {
    initiatePayment(featureId);
  };

  // Check if user has access to a specific feature
  const hasFeature = useCallback((featureId: FeatureId): boolean => {
    if (isTrialActive && trialDaysLeft > 0) return true;
    return purchasedFeatures.includes(featureId);
  }, [purchasedFeatures, isTrialActive, trialDaysLeft]);

  const startTrial = async () => {
    if (!user) return false;

    // Check if trial has already been used (from database)
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("trial_started_at")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error checking trial status:", error);
        return false;
      }

      // If trial already started, don't allow restart
      if (profile?.trial_started_at) {
        toast({
          title: "Provperiod redan använd",
          description: "Du har redan använt din gratis provperiod.",
          variant: "destructive",
        });
        return false;
      }

      // Start trial by saving to database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ trial_started_at: new Date().toISOString() })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Error starting trial:", updateError);
        toast({
          title: "Något gick fel",
          description: "Kunde inte starta provperioden. Försök igen.",
          variant: "destructive",
        });
        return false;
      }

      setIsPremium(true);
      setPurchasedFeatures(ALL_PREMIUM_FEATURES);
      setIsTrialActive(true);
      setTrialDaysLeft(TRIAL_DURATION_DAYS);
      
      toast({
        title: "Provperiod startad! 🎉",
        description: "Du har nu 7 dagars gratis tillgång till alla Premium-funktioner.",
      });
      
      return true;
    } catch (e) {
      console.error("Error in startTrial:", e);
      return false;
    }
  };

  // Check if trial has been used (async, but provide sync fallback for UI)
  const [hasUsedTrial, setHasUsedTrial] = useState(false);
  
  useEffect(() => {
    const checkTrialUsed = async () => {
      if (!user) {
        setHasUsedTrial(false);
        return;
      }
      
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("trial_started_at")
          .eq("user_id", user.id)
          .single();
        
        setHasUsedTrial(!!profile?.trial_started_at);
      } catch {
        setHasUsedTrial(false);
      }
    };
    
    checkTrialUsed();
  }, [user, isTrialActive]);

  return { 
    isPremium, 
    purchasedFeatures,
    hasFeature,
    isLoading, 
    activatePremium,
    purchaseFeature,
    initiatePayment,
    isProcessingPayment,
    startTrial, 
    isTrialActive, 
    trialDaysLeft,
    hasUsedTrial,
    refreshPremiumStatus: checkPremiumStatus,
    openCustomerPortal
  };
}
