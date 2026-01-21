import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface WeddingWebsite {
  id: string;
  user_id: string;
  slug: string;
  is_published: boolean;
  couple_names: string | null;
  couple_description: string | null;
  couple_photo_url: string | null;
  wedding_date: string | null;
  ceremony_time: string | null;
  ceremony_location: string | null;
  ceremony_address: string | null;
  reception_location: string | null;
  reception_address: string | null;
  theme: string;
  primary_color: string | null;
  secondary_color: string | null;
  font_family: string | null;
  our_story: string | null;
  additional_info: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeddingPhoto {
  id: string;
  website_id: string;
  photo_url: string;
  caption: string | null;
  display_order: number;
  created_at: string;
}

function generateSlug(): string {
  const adjectives = ['lyckliga', 'karleksfulla', 'foralskade', 'gladaste', 'basta'];
  const nouns = ['paret', 'tva', 'hjartan', 'drommar', 'saga'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${adj}-${noun}-${num}`;
}

export function useWeddingWebsite() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [website, setWebsite] = useState<WeddingWebsite | null>(null);
  const [photos, setPhotos] = useState<WeddingPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchWebsite = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("wedding_websites")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching website:", error);
        return;
      }

      setWebsite(data);
      
      if (data) {
        const { data: photoData, error: photoError } = await supabase
          .from("wedding_photos")
          .select("*")
          .eq("website_id", data.id)
          .order("display_order", { ascending: true });
          
        if (!photoError && photoData) {
          setPhotos(photoData);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWebsite();
  }, [fetchWebsite]);

  const createWebsite = useCallback(async () => {
    if (!user) return null;

    try {
      const slug = generateSlug();
      const { data, error } = await supabase
        .from("wedding_websites")
        .insert({
          user_id: user.id,
          slug,
        })
        .select()
        .single();

      if (error) throw error;

      setWebsite(data);
      toast({
        title: "Hemsida skapad!",
        description: "Din bröllopshemsida har skapats.",
      });
      return data;
    } catch (error) {
      console.error("Error creating website:", error);
      toast({
        title: "Fel",
        description: "Kunde inte skapa hemsidan.",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast]);

  const updateWebsite = useCallback(async (updates: Partial<WeddingWebsite>) => {
    if (!website) return false;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("wedding_websites")
        .update(updates)
        .eq("id", website.id);

      if (error) throw error;

      setWebsite(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Sparad!",
        description: "Dina ändringar har sparats.",
      });
      return true;
    } catch (error) {
      console.error("Error updating website:", error);
      toast({
        title: "Fel",
        description: "Kunde inte spara ändringar.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [website, toast]);

  const togglePublish = useCallback(async () => {
    if (!website) return false;
    return updateWebsite({ is_published: !website.is_published });
  }, [website, updateWebsite]);

  const uploadPhoto = useCallback(async (file: File): Promise<string | null> => {
    if (!user || !website) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("wedding-photos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("wedding-photos")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Fel",
        description: "Kunde inte ladda upp bilden.",
        variant: "destructive",
      });
      return null;
    }
  }, [user, website, toast]);

  const addPhoto = useCallback(async (photoUrl: string, caption?: string) => {
    if (!website) return null;

    try {
      const { data, error } = await supabase
        .from("wedding_photos")
        .insert({
          website_id: website.id,
          photo_url: photoUrl,
          caption,
          display_order: photos.length,
        })
        .select()
        .single();

      if (error) throw error;

      setPhotos(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error("Error adding photo:", error);
      return null;
    }
  }, [website, photos.length]);

  const removePhoto = useCallback(async (photoId: string) => {
    try {
      const { error } = await supabase
        .from("wedding_photos")
        .delete()
        .eq("id", photoId);

      if (error) throw error;

      setPhotos(prev => prev.filter(p => p.id !== photoId));
      return true;
    } catch (error) {
      console.error("Error removing photo:", error);
      return false;
    }
  }, []);

  return {
    website,
    photos,
    isLoading,
    isSaving,
    createWebsite,
    updateWebsite,
    togglePublish,
    uploadPhoto,
    addPhoto,
    removePhoto,
    refetch: fetchWebsite,
  };
}
