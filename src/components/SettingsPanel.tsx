import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, User, Heart, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

export function SettingsPanel() {
  const { profile, isLoading, updateWeddingDate, updateProfile } = useProfile();
  const [weddingDate, setWeddingDate] = useState<Date | undefined>();
  const [partnerName, setPartnerName] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setWeddingDate(profile.wedding_date ? new Date(profile.wedding_date) : undefined);
      setPartnerName(profile.partner_name || "");
      setFullName(profile.full_name || "");
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (weddingDate) {
        await updateWeddingDate(weddingDate);
      }
      await updateProfile({ partner_name: partnerName, full_name: fullName });
      toast.success("Inställningar sparade!");
    } catch (error) {
      toast.error("Kunde inte spara inställningar");
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Laddar inställningar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-8 border border-border shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-medium text-foreground">
              Bröllopsdatum
            </h3>
            <p className="text-sm text-muted-foreground">
              Välj datum för ert bröllop
            </p>
          </div>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-12",
                !weddingDate && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {weddingDate ? (
                format(weddingDate, "d MMMM yyyy", { locale: sv })
              ) : (
                "Välj datum"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarPicker
              mode="single"
              selected={weddingDate}
              onSelect={setWeddingDate}
              initialFocus
              locale={sv}
            />
          </PopoverContent>
        </Popover>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-8 border border-border shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-medium text-foreground">
              Er information
            </h3>
            <p className="text-sm text-muted-foreground">
              Ange era namn
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Ditt namn</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ditt förnamn"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partnerName">Din partners namn</Label>
            <Input
              id="partnerName"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="Din partners förnamn"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button 
          onClick={handleSave} 
          className="w-full h-12 gap-2"
          disabled={isSaving}
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Sparar..." : "Spara inställningar"}
        </Button>
      </motion.div>
    </div>
  );
}
