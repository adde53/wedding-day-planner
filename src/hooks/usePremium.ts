import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function usePremium() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user) {
        setIsPremium(false);
        setIsLoading(false);
        return;
      }

      // Check localStorage for premium status (can be connected to Stripe later)
      const storedPremium = localStorage.getItem(`premium_${user.id}`);
      if (storedPremium === "true") {
        setIsPremium(true);
      }

      setIsLoading(false);
    };

    checkPremiumStatus();
  }, [user]);

  const activatePremium = () => {
    if (user) {
      localStorage.setItem(`premium_${user.id}`, "true");
      setIsPremium(true);
    }
  };

  return { isPremium, isLoading, activatePremium };
}
