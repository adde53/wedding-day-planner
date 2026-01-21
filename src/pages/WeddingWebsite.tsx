import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Calendar, MapPin, Clock, Users, Send, Check, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface WebsiteData {
  id: string;
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
  user_id: string;
}

interface WeddingPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
}

interface GuestData {
  id: string;
  name: string;
  dietary_restrictions: string | null;
  plus_one: boolean | null;
  plus_one_name: string | null;
  rsvp_status: string;
  notes: string | null;
}

export default function WeddingWebsite() {
  const { slug } = useParams();
  const { toast } = useToast();
  const [website, setWebsite] = useState<WebsiteData | null>(null);
  const [photos, setPhotos] = useState<WeddingPhoto[]>([]);
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("rsvp");
  
  // RSVP form state
  const [rsvpResponse, setRsvpResponse] = useState<"confirmed" | "declined">("confirmed");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [plusOneName, setPlusOneName] = useState("");
  const [rsvpNotes, setRsvpNotes] = useState("");

  useEffect(() => {
    const fetchWebsite = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from("wedding_websites")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setWebsite(data);

      // Fetch photos
      const { data: photoData } = await supabase
        .from("wedding_photos")
        .select("*")
        .eq("website_id", data.id)
        .order("display_order", { ascending: true });

      if (photoData) {
        setPhotos(photoData);
      }

      setIsLoading(false);
    };

    fetchWebsite();
  }, [slug]);

  const verifyAccessCode = async () => {
    if (!website || !accessCode.trim()) return;
    
    setIsVerifying(true);
    
    // Find guest with this access code
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .eq("user_id", website.user_id)
      .eq("access_code", accessCode.toUpperCase())
      .maybeSingle();

    if (error || !data) {
      toast({
        title: "Ogiltig kod",
        description: "Kontrollera att du har angett rätt kod.",
        variant: "destructive",
      });
      setIsVerifying(false);
      return;
    }

    setGuest(data);
    setDietaryRestrictions(data.dietary_restrictions || "");
    setPlusOneName(data.plus_one_name || "");
    setRsvpNotes(data.notes || "");
    if (data.rsvp_status !== "pending") {
      setRsvpResponse(data.rsvp_status as "confirmed" | "declined");
    }
    setIsVerifying(false);
  };

  const submitRsvp = async () => {
    if (!guest) return;

    setIsSubmitting(true);

    const { error } = await supabase
      .from("guests")
      .update({
        rsvp_status: rsvpResponse,
        dietary_restrictions: dietaryRestrictions || null,
        plus_one_name: plusOneName || null,
        notes: rsvpNotes || null,
        rsvp_date: new Date().toISOString(),
      })
      .eq("id", guest.id);

    if (error) {
      toast({
        title: "Fel",
        description: "Kunde inte skicka OSA. Försök igen.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    setRsvpSubmitted(true);
    setIsSubmitting(false);
    toast({
      title: "Tack!",
      description: "Ditt svar har skickats.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Laddar...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-serif text-2xl text-foreground mb-2">Sidan hittades inte</h1>
          <p className="text-muted-foreground">
            Kontrollera att du har rätt länk.
          </p>
        </div>
      </div>
    );
  }

  if (!website) return null;

  const primaryColor = website.primary_color || "#D4A574";
  const secondaryColor = website.secondary_color || "#8B7355";

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("sv-SE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fontClass = website.font_family === "sans" 
    ? "font-sans" 
    : website.font_family === "script" 
      ? "font-serif italic" 
      : "font-serif";

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: `linear-gradient(180deg, ${primaryColor}08 0%, white 100%)`,
      }}
    >
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 text-center px-4">
        {website.couple_photo_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-32 h-32 md:w-48 md:h-48 mx-auto mb-8 rounded-full overflow-hidden border-4 shadow-lg"
            style={{ borderColor: primaryColor }}
          >
            <img 
              src={website.couple_photo_url} 
              alt="Brudparet" 
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p 
            className="text-sm uppercase tracking-widest mb-4"
            style={{ color: secondaryColor }}
          >
            Vi gifter oss
          </p>
          <h1 
            className={cn("text-4xl md:text-6xl lg:text-7xl mb-6", fontClass)}
            style={{ color: primaryColor }}
          >
            {website.couple_names || "Brudparet"}
          </h1>
          {website.wedding_date && (
            <p 
              className="text-xl md:text-2xl"
              style={{ color: secondaryColor }}
            >
              {formatDate(website.wedding_date)}
            </p>
          )}
        </motion.div>

        {website.couple_description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 max-w-2xl mx-auto text-muted-foreground"
          >
            {website.couple_description}
          </motion.p>
        )}
      </section>

      {/* Access Code Entry */}
      {!guest && (
        <section className="py-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto bg-card rounded-2xl p-8 shadow-lg border border-border"
          >
            <div className="text-center mb-6">
              <Users className="w-10 h-10 mx-auto mb-3" style={{ color: primaryColor }} />
              <h2 className={cn("text-2xl mb-2", fontClass)} style={{ color: primaryColor }}>
                Ange din personliga kod
              </h2>
              <p className="text-sm text-muted-foreground">
                Du hittar koden i din inbjudan
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="access_code">Din kod</Label>
                <Input
                  id="access_code"
                  placeholder="T.ex. ABC123"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="text-center text-lg tracking-widest uppercase"
                  maxLength={6}
                />
              </div>
              <Button 
                onClick={verifyAccessCode}
                disabled={isVerifying || !accessCode.trim()}
                className="w-full"
                style={{ backgroundColor: primaryColor }}
              >
                {isVerifying ? "Verifierar..." : "Fortsätt"}
              </Button>
            </div>
          </motion.div>
        </section>
      )}

      {/* Content for verified guests */}
      {guest && (
        <>
          {/* Welcome Message */}
          <section className="py-8 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              <p className="text-lg text-muted-foreground">
                Välkommen, <span className="font-medium" style={{ color: primaryColor }}>{guest.name}</span>!
              </p>
            </motion.div>
          </section>

          {/* RSVP Section */}
          <section className="py-8 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto bg-card rounded-2xl shadow-lg border border-border overflow-hidden"
            >
              <button
                onClick={() => toggleSection("rsvp")}
                className="w-full p-6 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5" style={{ color: primaryColor }} />
                  <h2 className={cn("text-xl", fontClass)} style={{ color: primaryColor }}>
                    OSA
                  </h2>
                </div>
                {expandedSection === "rsvp" ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              <AnimatePresence>
                {expandedSection === "rsvp" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 space-y-6">
                      {rsvpSubmitted ? (
                        <div className="text-center py-8">
                          <div 
                            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${primaryColor}20` }}
                          >
                            <Check className="w-8 h-8" style={{ color: primaryColor }} />
                          </div>
                          <h3 className={cn("text-xl mb-2", fontClass)}>Tack för ditt svar!</h3>
                          <p className="text-muted-foreground">
                            {rsvpResponse === "confirmed" 
                              ? "Vi ser fram emot att fira med dig!" 
                              : "Vi förstår, vi hoppas ses snart!"}
                          </p>
                        </div>
                      ) : (
                        <>
                          <RadioGroup 
                            value={rsvpResponse} 
                            onValueChange={(v) => setRsvpResponse(v as "confirmed" | "declined")}
                          >
                            <div className="flex items-center space-x-2 p-4 rounded-lg border border-border">
                              <RadioGroupItem value="confirmed" id="confirmed" />
                              <Label htmlFor="confirmed" className="flex-1 cursor-pointer">
                                <span className="font-medium">Jag kommer!</span>
                                <span className="block text-sm text-muted-foreground">
                                  Vi ses på bröllopet
                                </span>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-4 rounded-lg border border-border">
                              <RadioGroupItem value="declined" id="declined" />
                              <Label htmlFor="declined" className="flex-1 cursor-pointer">
                                <span className="font-medium">Jag kan tyvärr inte komma</span>
                                <span className="block text-sm text-muted-foreground">
                                  Skicka önskning ändå
                                </span>
                              </Label>
                            </div>
                          </RadioGroup>

                          {rsvpResponse === "confirmed" && (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="dietary">Matpreferenser / allergier</Label>
                                <Input
                                  id="dietary"
                                  placeholder="T.ex. vegetarian, glutenfri..."
                                  value={dietaryRestrictions}
                                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                                />
                              </div>

                              {guest.plus_one && (
                                <div>
                                  <Label htmlFor="plusone">Namn på din +1</Label>
                                  <Input
                                    id="plusone"
                                    placeholder="Förnamn Efternamn"
                                    value={plusOneName}
                                    onChange={(e) => setPlusOneName(e.target.value)}
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          <div>
                            <Label htmlFor="notes">Meddelande till brudparet (valfritt)</Label>
                            <Textarea
                              id="notes"
                              placeholder="Skriv något fint..."
                              rows={3}
                              value={rsvpNotes}
                              onChange={(e) => setRsvpNotes(e.target.value)}
                            />
                          </div>

                          <Button 
                            onClick={submitRsvp}
                            disabled={isSubmitting}
                            className="w-full"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {isSubmitting ? "Skickar..." : "Skicka svar"}
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </section>

          {/* Event Details */}
          {(website.ceremony_location || website.reception_location) && (
            <section className="py-8 px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto bg-card rounded-2xl shadow-lg border border-border overflow-hidden"
              >
                <button
                  onClick={() => toggleSection("details")}
                  className="w-full p-6 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5" style={{ color: primaryColor }} />
                    <h2 className={cn("text-xl", fontClass)} style={{ color: primaryColor }}>
                      Plats & tid
                    </h2>
                  </div>
                  {expandedSection === "details" ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSection === "details" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 space-y-6">
                        {website.ceremony_location && (
                          <div className="flex gap-4">
                            <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${primaryColor}15` }}
                            >
                              <Heart className="w-5 h-5" style={{ color: primaryColor }} />
                            </div>
                            <div>
                              <h3 className="font-medium text-foreground">Vigsel</h3>
                              <p className="text-muted-foreground">{website.ceremony_location}</p>
                              {website.ceremony_address && (
                                <p className="text-sm text-muted-foreground">{website.ceremony_address}</p>
                              )}
                              {website.ceremony_time && (
                                <p className="text-sm mt-1 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                                  {website.ceremony_time}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {website.reception_location && (
                          <div className="flex gap-4">
                            <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${primaryColor}15` }}
                            >
                              <Users className="w-5 h-5" style={{ color: primaryColor }} />
                            </div>
                            <div>
                              <h3 className="font-medium text-foreground">Fest</h3>
                              <p className="text-muted-foreground">{website.reception_location}</p>
                              {website.reception_address && (
                                <p className="text-sm text-muted-foreground">{website.reception_address}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </section>
          )}

          {/* Our Story */}
          {website.our_story && (
            <section className="py-8 px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto bg-card rounded-2xl shadow-lg border border-border overflow-hidden"
              >
                <button
                  onClick={() => toggleSection("story")}
                  className="w-full p-6 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5" style={{ color: primaryColor }} />
                    <h2 className={cn("text-xl", fontClass)} style={{ color: primaryColor }}>
                      Vår historia
                    </h2>
                  </div>
                  {expandedSection === "story" ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSection === "story" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <p className="text-muted-foreground whitespace-pre-line">
                          {website.our_story}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </section>
          )}

          {/* Photo Gallery */}
          {photos.length > 0 && (
            <section className="py-8 px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
              >
                <h2 
                  className={cn("text-2xl text-center mb-8", fontClass)}
                  style={{ color: primaryColor }}
                >
                  Våra bilder
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, i) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="aspect-square rounded-xl overflow-hidden shadow-md"
                    >
                      <img 
                        src={photo.photo_url} 
                        alt={photo.caption || "Bröllopsbild"} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </section>
          )}

          {/* Additional Info */}
          {website.additional_info && (
            <section className="py-8 px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto bg-card rounded-2xl shadow-lg border border-border overflow-hidden"
              >
                <button
                  onClick={() => toggleSection("info")}
                  className="w-full p-6 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" style={{ color: primaryColor }} />
                    <h2 className={cn("text-xl", fontClass)} style={{ color: primaryColor }}>
                      Praktisk information
                    </h2>
                  </div>
                  {expandedSection === "info" ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSection === "info" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <p className="text-muted-foreground whitespace-pre-line">
                          {website.additional_info}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </section>
          )}
        </>
      )}

      {/* Footer */}
      <footer className="py-12 text-center">
        <Heart className="w-6 h-6 mx-auto mb-2" style={{ color: primaryColor }} />
        <p className="text-sm text-muted-foreground">
          {website.couple_names || "Brudparet"}
        </p>
      </footer>
    </div>
  );
}
