import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Heart, 
  Save, 
  Lock, 
  Mail, 
  Bell, 
  Shield, 
  LogOut,
  Check,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function SettingsPanel() {
  const { profile, isLoading, updateWeddingDate, updateProfile } = useProfile();
  const { user, signOut } = useAuth();
  const [weddingDate, setWeddingDate] = useState<Date | undefined>();
  const [partnerName, setPartnerName] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Password change
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Notification preferences (local state for demo)
  const [emailReminders, setEmailReminders] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

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

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Lösenorden matchar inte");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Lösenordet måste vara minst 6 tecken");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success("Lösenordet har ändrats!");
      setIsPasswordDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Kunde inte ändra lösenord");
    }
    setIsChangingPassword(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Du har loggats ut");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Laddar inställningar...</div>
      </div>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 }
    })
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-serif text-2xl font-medium text-foreground">Inställningar</h2>
        <p className="text-muted-foreground mt-1">Anpassa din bröllopplanerare</p>
      </motion.div>

      {/* Wedding Date Card */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-lg font-medium text-foreground">
              Bröllopsdatum
            </h3>
            <p className="text-sm text-muted-foreground">
              Den stora dagen
            </p>
          </div>
          {weddingDate && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Check className="w-4 h-4" />
              Valt
            </div>
          )}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-12 border-dashed",
                !weddingDate && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-3 h-4 w-4 text-primary" />
              {weddingDate ? (
                <span className="font-medium">{format(weddingDate, "d MMMM yyyy", { locale: sv })}</span>
              ) : (
                "Välj ert bröllopsdatum"
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

      {/* Couple Info Card */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center">
            <Heart className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-foreground">
              Era namn
            </h3>
            <p className="text-sm text-muted-foreground">
              Personligt för er planering
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">Ditt namn</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ditt förnamn"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partnerName" className="text-sm font-medium">Din partners namn</Label>
            <Input
              id="partnerName"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="Partners förnamn"
              className="h-11"
            />
          </div>
        </div>
      </motion.div>

      {/* Account Security Card */}
      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage-muted/40 to-sage-muted/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-foreground">
              Konto & säkerhet
            </h3>
            <p className="text-sm text-muted-foreground">
              Hantera dina kontouppgifter
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Email display */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">E-postadress</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Password change */}
          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogTrigger asChild>
              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Lösenord</p>
                    <p className="text-sm text-muted-foreground">Byt ditt lösenord</p>
                  </div>
                </div>
                <span className="text-sm text-primary font-medium">Ändra</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif">Byt lösenord</DialogTitle>
                <DialogDescription>
                  Ange ditt nya lösenord nedan.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nytt lösenord</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minst 6 tecken"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Bekräfta lösenord</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Upprepa lösenordet"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsPasswordDialogOpen(false)}
                  >
                    Avbryt
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !newPassword || !confirmPassword}
                  >
                    {isChangingPassword ? "Sparar..." : "Spara"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Notifications Card */}
      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
            <Bell className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-foreground">
              Notifikationer
            </h3>
            <p className="text-sm text-muted-foreground">
              Påminnelser och uppdateringar
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">E-postpåminnelser</p>
                <p className="text-sm text-muted-foreground">Få påminnelser om deadlines</p>
              </div>
            </div>
            <Switch 
              checked={emailReminders} 
              onCheckedChange={setEmailReminders}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">Veckosammanfattning</p>
                <p className="text-sm text-muted-foreground">Veckans planering i din inbox</p>
              </div>
            </div>
            <Switch 
              checked={weeklyDigest} 
              onCheckedChange={setWeeklyDigest}
            />
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        custom={4}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="pt-2"
      >
        <Button 
          onClick={handleSave} 
          className="w-full h-12 gap-2 text-base font-medium shadow-md hover:shadow-lg transition-shadow"
          disabled={isSaving}
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Sparar..." : "Spara alla inställningar"}
        </Button>
      </motion.div>

      <Separator className="my-6" />

      {/* Sign Out */}
      <motion.div
        custom={5}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          className="w-full h-12 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
        >
          <LogOut className="w-5 h-5" />
          Logga ut
        </Button>
      </motion.div>
    </div>
  );
}
