import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bug, Lightbulb, MessageCircle, Send, Loader2 } from "lucide-react";
import { z } from "zod";

const supportSchema = z.object({
  name: z.string().trim().min(1, "Namn krävs").max(100, "Namnet får max vara 100 tecken"),
  email: z.string().trim().email("Ogiltig e-postadress").max(255, "E-postadressen får max vara 255 tecken"),
  subject: z.string().trim().min(1, "Ämne krävs").max(200, "Ämnet får max vara 200 tecken"),
  message: z.string().trim().min(10, "Meddelandet måste vara minst 10 tecken").max(5000, "Meddelandet får max vara 5000 tecken"),
  type: z.enum(["bug", "suggestion", "other"]),
});

interface SupportDialogProps {
  children: React.ReactNode;
}

export function SupportDialog({ children }: SupportDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "other" as "bug" | "suggestion" | "other",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = supportSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-support-email", {
        body: formData,
      });

      if (error) throw error;

      toast.success("Tack! Ditt meddelande har skickats.");
      setFormData({ name: "", email: "", subject: "", message: "", type: "other" });
      setOpen(false);
    } catch (error: any) {
      console.error("Error sending support email:", error);
      toast.error("Kunde inte skicka meddelandet. Försök igen senare.");
    } finally {
      setIsLoading(false);
    }
  };

  const typeIcons = {
    bug: <Bug className="w-4 h-4" />,
    suggestion: <Lightbulb className="w-4 h-4" />,
    other: <MessageCircle className="w-4 h-4" />,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Kontakta support</DialogTitle>
          <DialogDescription>
            Rapportera buggar, föreslå förbättringar eller ställ frågor.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Namn</Label>
              <Input
                id="name"
                placeholder="Ditt namn"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                placeholder="din@epost.se"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                maxLength={255}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Typ av ärende</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "bug" | "suggestion" | "other") => 
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">
                  <span className="flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Buggrapport
                  </span>
                </SelectItem>
                <SelectItem value="suggestion">
                  <span className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Förbättringsförslag
                  </span>
                </SelectItem>
                <SelectItem value="other">
                  <span className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Övrigt
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Ämne</Label>
            <Input
              id="subject"
              placeholder="Kort beskrivning av ärendet"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Meddelande</Label>
            <Textarea
              id="message"
              placeholder="Beskriv ditt ärende i detalj..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              className="min-h-[120px]"
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.message.length}/5000
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Skickar...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Skicka meddelande
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
