import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const TRIAL_DURATION_DAYS = 7;

export function usePremium() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPremium, setIsPremium] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const checkPremiumStatus = useCallback(async () => {
    if (!user) {
      setIsPremium(false);
      setIsTrialActive(false);
      setTrialDaysLeft(0);
      setIsLoading(false);
      return;
    }

    // First check Stripe for paid premium
    try {
      const { data, error } = await supabase.functions.invoke('check-premium');
      
      if (!error && data?.isPremium) {
        setIsPremium(true);
        setIsTrialActive(false);
        setIsLoading(false);
        // Also save to localStorage as backup
        localStorage.setItem(`premium_${user.id}`, "true");
        return;
      }
    } catch (e) {
      console.log("Could not check Stripe premium status, falling back to local");
    }

    // Check for local premium status (backup)
    const storedPremium = localStorage.getItem(`premium_${user.id}`);
    if (storedPremium === "true") {
      setIsPremium(true);
      setIsTrialActive(false);
      setIsLoading(false);
      return;
    }

    // Check for active trial
    const trialStartStr = localStorage.getItem(`premium_trial_start_${user.id}`);
    if (trialStartStr) {
      const trialStart = new Date(trialStartStr);
      const now = new Date();
      const diffTime = now.getTime() - trialStart.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const daysLeft = TRIAL_DURATION_DAYS - diffDays;

      if (daysLeft > 0) {
        setIsPremium(true);
        setIsTrialActive(true);
        setTrialDaysLeft(daysLeft);
      } else {
        setIsPremium(false);
        setIsTrialActive(false);
        setTrialDaysLeft(0);
      }
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
    
    if (paymentStatus === 'success' && user) {
      toast({
        title: "Betalning genomförd! 🎉",
        description: "Tack för ditt köp! Du har nu tillgång till alla Premium-funktioner.",
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

  const initiatePayment = async () => {
    if (!user) {
      toast({
        title: "Logga in först",
        description: "Du måste vara inloggad för att köpa Premium.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment');
      
      if (error) throw error;
      
      if (data?.url) {
        // Use direct assignment to avoid popup blockers
        // This replaces the current page with Stripe checkout
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
    // Note: Don't reset isProcessingPayment on success since we're navigating away
  };

  const activatePremium = () => {
    // This now initiates Stripe payment
    initiatePayment();
  };

  const startTrial = () => {
    if (user) {
      const hasUsedTrial = localStorage.getItem(`premium_trial_used_${user.id}`);
      if (hasUsedTrial) {
        return false;
      }
      
      localStorage.setItem(`premium_trial_start_${user.id}`, new Date().toISOString());
      localStorage.setItem(`premium_trial_used_${user.id}`, "true");
      setIsPremium(true);
      setIsTrialActive(true);
      setTrialDaysLeft(TRIAL_DURATION_DAYS);
      toast({
        title: "Provperiod startad! 🎉",
        description: "Du har nu 7 dagars gratis tillgång till alla Premium-funktioner.",
      });
      return true;
    }
    return false;
  };

  const hasUsedTrial = user ? localStorage.getItem(`premium_trial_used_${user.id}`) === "true" : false;

  return { 
    isPremium, 
    isLoading, 
    activatePremium,
    initiatePayment,
    isProcessingPayment,
    startTrial, 
    isTrialActive, 
    trialDaysLeft,
    hasUsedTrial,
    refreshPremiumStatus: checkPremiumStatus
  };
}
