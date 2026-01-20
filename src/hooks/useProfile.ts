import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  partner_name: string | null;
  wedding_date: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      }

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateWeddingDate = useCallback(
    async (date: Date | null) => {
      if (!user) return;

      const dateString = date ? date.toISOString().split("T")[0] : null;

      try {
        const { error } = await supabase
          .from("profiles")
          .update({ wedding_date: dateString })
          .eq("user_id", user.id);

        if (error) throw error;

        setProfile((prev) =>
          prev ? { ...prev, wedding_date: dateString } : null
        );
        toast.success("Bröllopsdatum uppdaterat!");
      } catch (error) {
        console.error("Error updating wedding date:", error);
        toast.error("Kunde inte uppdatera bröllopsdatum");
      }
    },
    [user]
  );

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("user_id", user.id);

        if (error) throw error;

        setProfile((prev) => (prev ? { ...prev, ...updates } : null));
        toast.success("Profil uppdaterad!");
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("Kunde inte uppdatera profil");
      }
    },
    [user]
  );

  return {
    profile,
    isLoading,
    updateWeddingDate,
    updateProfile,
    refetch: fetchProfile,
  };
}
