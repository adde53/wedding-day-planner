import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const TRIAL_DURATION_DAYS = 7;

export function usePremium() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user) {
        setIsPremium(false);
        setIsTrialActive(false);
        setTrialDaysLeft(0);
        setIsLoading(false);
        return;
      }

      // Check for paid premium status
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
    };

    checkPremiumStatus();
  }, [user]);

  const activatePremium = () => {
    if (user) {
      localStorage.setItem(`premium_${user.id}`, "true");
      localStorage.removeItem(`premium_trial_start_${user.id}`);
      setIsPremium(true);
      setIsTrialActive(false);
    }
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
      return true;
    }
    return false;
  };

  const hasUsedTrial = user ? localStorage.getItem(`premium_trial_used_${user.id}`) === "true" : false;

  return { 
    isPremium, 
    isLoading, 
    activatePremium, 
    startTrial, 
    isTrialActive, 
    trialDaysLeft,
    hasUsedTrial 
  };
}
